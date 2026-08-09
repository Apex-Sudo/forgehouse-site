import { extractLimiter } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import { ExtractionAgentNode } from "@/lib/agent/nodes/ExtractionAgentNode";
import { guardSession } from "@/lib/extraction/session-guard";
import {
  artifactTextFor,
  buildPriorSummary,
  ensureModules,
  getModule,
  reconcileProgram,
  updateModule,
} from "@/lib/extraction/store";
import { buildModulePrompt } from "@/lib/extraction/module-prompts";
import { parseModuleReply, stripMeta } from "@/lib/extraction/coverage-meta";
import { MODULE_BY_TYPE, isModuleType } from "@/lib/extraction/modules";
import { parseStreamChunk } from "@/lib/agent/helper/stream";

/**
 * Streaming chat for one extraction module.
 *
 * The mentor's turn is persisted BEFORE the model runs, and the assistant's
 * turn is persisted from a server-side tee of the stream, so a dropped
 * connection can't lose a session. The machine-readable footer is stripped
 * before storage — it is never shown to or stored for the mentor.
 */
export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { success } = await extractLimiter().limit(ip);
    if (!success) {
      return Response.json(
        { error: "Rate limit exceeded. Take a break and come back." },
        { status: 429 }
      );
    }

    const { onboardingId, moduleType, message } = (await req.json()) as {
      onboardingId?: string;
      moduleType?: string;
      message?: string;
    };

    if (!onboardingId || !moduleType) {
      return Response.json({ error: "Missing session or module" }, { status: 400 });
    }
    if (!isModuleType(moduleType)) {
      return Response.json({ error: "Unknown module" }, { status: 404 });
    }

    const guard = await guardSession(onboardingId);
    if (!guard.ok) {
      return Response.json({ error: guard.error }, { status: guard.status });
    }

    await ensureModules(onboardingId);
    const module = await getModule(onboardingId, moduleType);
    if (!module) {
      return Response.json({ error: "Module not found" }, { status: 404 });
    }
    if (module.status === "locked") {
      return Response.json(
        { error: "Finish the previous session first" },
        { status: 409 }
      );
    }

    // Persist the mentor's turn up front — losing it to a network blip would
    // mean asking them to retype what they just said.
    const trimmed = message?.trim();
    const history = [...module.messages];
    if (trimmed) {
      history.push({ role: "user", content: trimmed });
      await updateModule(onboardingId, moduleType, {
        messages: history,
        status: module.status === "complete" ? "complete" : "in_progress",
      });
    } else if (history.length === 0) {
      // Opening turn: the model speaks first, so mark the module started.
      await updateModule(onboardingId, moduleType, { status: "in_progress" });
    }

    const allModules = await ensureModules(onboardingId);

    // Corpus mined ahead of the interview, so sessions probe gaps not basics.
    const { data: corpusRows } = await supabase
      .from("mentor_corpus")
      .select("title, raw_text")
      .eq("onboarding_id", onboardingId)
      .eq("status", "processed")
      .limit(20);

    const corpusSummary = (corpusRows ?? [])
      .map((r) => {
        const text = (r.raw_text ?? "").slice(0, 1500);
        return r.title ? `**${r.title}**\n${text}` : text;
      })
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 12000);

    const systemPrompt = buildModulePrompt(moduleType, {
      mentorName: guard.session.mentorName,
      corpusSummary,
      priorSummary: buildPriorSummary(allModules, moduleType),
      artifactText: artifactTextFor(module),
    });

    // The model needs at least one turn to respond to.
    const modelMessages =
      history.length > 0
        ? history
        : [{ role: "user" as const, content: "Let's begin." }];

    const node = new ExtractionAgentNode();
    const upstream = node.run({ messages: modelMessages, systemPrompt });

    // Tee: forward every byte to the client while accumulating the text so the
    // completed turn can be persisted server-side.
    let accumulated = "";
    let ndjsonBuffer = "";
    const decoder = new TextDecoder();

    const persist = async () => {
      const { display, meta } = parseModuleReply(accumulated);
      const clean = stripMeta(display).trim();
      if (!clean) return;

      const next = [...history, { role: "assistant" as const, content: clean }];
      const def = MODULE_BY_TYPE[moduleType];
      const userTurns = next.filter((m) => m.role === "user").length;

      // Complete when the model says so, or once the mentor has clearly put in
      // the work — the escape hatch stops a cautious model trapping them.
      const shouldComplete = meta.complete || userTurns >= def.escapeHatch;

      // The footer reports the golden set cumulatively, so merge by scenario —
      // appending would duplicate earlier scenarios on every turn. A repeated
      // scenario keeps the newest answer, which reflects any correction.
      let goldenSet: { scenario: string; mentorAnswer: string }[] | undefined;
      if (meta.golden) {
        const merged = new Map(
          module.goldenSet.map((g) => [g.scenario.trim(), g] as const)
        );
        for (const g of meta.golden) merged.set(g.scenario.trim(), g);
        goldenSet = [...merged.values()];
      }

      await updateModule(onboardingId, moduleType, {
        messages: next,
        coverage: Object.keys(meta.coverage).length > 0 ? meta.coverage : undefined,
        status: shouldComplete ? "complete" : "in_progress",
        goldenSet,
      });
      await reconcileProgram(onboardingId);
    };

    const tee = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        const { events, remaining } = parseStreamChunk(
          decoder.decode(chunk, { stream: true }),
          ndjsonBuffer
        );
        ndjsonBuffer = remaining;
        for (const event of events) {
          if (event.type === "text") accumulated += event.content;
        }
      },
      async flush() {
        try {
          await persist();
        } catch (err) {
          console.error("Module persist error:", err);
        }
      },
    });

    return new Response(upstream.pipeThrough(tee), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Module chat error:", err);
    return Response.json(
      {
        error: "Internal error",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
