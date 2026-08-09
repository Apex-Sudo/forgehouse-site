import { NextResponse } from "next/server";
import { guardSession } from "@/lib/extraction/session-guard";
import {
  ensureModules,
  getModule,
  reconcileProgram,
  updateModule,
} from "@/lib/extraction/store";
import { MODULE_BY_TYPE, isModuleType } from "@/lib/extraction/modules";
import { devSkipEnabled, DEV_SKIP_COVERAGE } from "@/lib/extraction/dev";

/** Transcript and state for one module. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; moduleType: string }> }
) {
  try {
    const { id, moduleType } = await params;
    const guard = await guardSession(id);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    if (!isModuleType(moduleType)) {
      return NextResponse.json({ error: "Unknown module" }, { status: 404 });
    }

    await ensureModules(id);
    const module = await getModule(id, moduleType);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const def = MODULE_BY_TYPE[moduleType];
    return NextResponse.json({
      type: module.moduleType,
      label: def.label,
      detail: def.detail,
      minutes: def.minutes,
      targets: def.targets,
      acceptsArtifacts: Boolean(def.acceptsArtifacts),
      escapeHatch: def.escapeHatch,
      status: module.status,
      messages: module.messages,
      coverage: module.coverage,
      artifacts: module.artifacts.map((a) => ({
        name: a.name,
        chars: a.chars,
        uploadedAt: a.uploadedAt,
      })),
      exchanges: module.messages.filter((m) => m.role === "user").length,
    });
  } catch (err) {
    console.error("Module fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Explicit state transitions the client owns: marking a module complete when
 * the mentor chooses to wrap up, and attaching artifact text.
 *
 * Message persistence is handled by the chat route so a dropped connection
 * can't lose a turn.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleType: string }> }
) {
  try {
    const { id, moduleType } = await params;
    const guard = await guardSession(id);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    if (!isModuleType(moduleType)) {
      return NextResponse.json({ error: "Unknown module" }, { status: 404 });
    }

    const body = (await request.json()) as {
      action?: "complete" | "reopen" | "add_artifact" | "dev_skip";
      artifact?: { name?: string; text?: string };
    };

    await ensureModules(id);
    const module = await getModule(id, moduleType);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    switch (body.action) {
      case "complete": {
        if (module.status === "locked") {
          return NextResponse.json(
            { error: "Module is not available yet" },
            { status: 409 }
          );
        }
        await updateModule(id, moduleType, { status: "complete" });
        break;
      }

      case "reopen": {
        // Mentors can come back and add more to a finished session.
        await updateModule(id, moduleType, { status: "in_progress" });
        break;
      }

      case "add_artifact": {
        const def = MODULE_BY_TYPE[moduleType];
        if (!def.acceptsArtifacts) {
          return NextResponse.json(
            { error: "This module does not take artifacts" },
            { status: 400 }
          );
        }
        const name = body.artifact?.name?.trim();
        const text = body.artifact?.text?.trim();
        if (!name || !text) {
          return NextResponse.json({ error: "Missing artifact" }, { status: 400 });
        }
        // Cap per artifact; the store caps the concatenated total again.
        const capped = text.length > 15000 ? `${text.slice(0, 15000)}…` : text;
        await updateModule(id, moduleType, {
          artifacts: [
            ...module.artifacts,
            {
              name,
              chars: capped.length,
              uploadedAt: new Date().toISOString(),
              // Retained for the prompt; the uploaded file itself is never stored.
              text: capped,
            },
          ],
        });
        break;
      }

      case "dev_skip": {
        if (!devSkipEnabled()) {
          return NextResponse.json({ error: "Not available" }, { status: 404 });
        }
        await updateModule(id, moduleType, {
          status: "complete",
          coverage: { ...DEV_SKIP_COVERAGE },
          messages: [
            ...module.messages,
            {
              role: "assistant",
              content:
                "[dev skip] This module was marked complete without a real session. Its coverage is synthetic.",
            },
          ],
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const modules = await reconcileProgram(id);
    return NextResponse.json({
      ok: true,
      modules: modules.map((m) => ({
        type: m.moduleType,
        status: m.status,
        coverage: m.coverage,
      })),
    });
  } catch (err) {
    console.error("Module patch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
