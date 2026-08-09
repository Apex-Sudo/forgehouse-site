import { NextResponse } from "next/server";
import { guardSession } from "@/lib/extraction/session-guard";
import { ensureModules, reconcileProgram } from "@/lib/extraction/store";
import {
  MODULES,
  TOTAL_MINUTES,
  aggregateCoverage,
  overallCoverage,
} from "@/lib/extraction/modules";

/**
 * The program dashboard's single read: every module with its status, coverage
 * and progress, plus the aggregate. Creates the module rows on first call.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guard = await guardSession(id);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    await ensureModules(id);
    const modules = await reconcileProgram(id);

    const coverage = aggregateCoverage(
      modules.map((m) => ({ moduleType: m.moduleType, coverage: m.coverage }))
    );

    return NextResponse.json({
      mentorName: guard.session.mentorName,
      programVersion: guard.session.programVersion,
      totalMinutes: TOTAL_MINUTES,
      coverage,
      overall: overallCoverage(coverage),
      modules: modules.map((m) => {
        const def = MODULES.find((d) => d.type === m.moduleType)!;
        return {
          type: m.moduleType,
          label: def.label,
          summary: def.summary,
          detail: def.detail,
          minutes: def.minutes,
          suggestedDay: def.suggestedDay,
          targets: def.targets,
          acceptsArtifacts: Boolean(def.acceptsArtifacts),
          status: m.status,
          coverage: m.coverage,
          exchanges: m.messages.filter((x) => x.role === "user").length,
          artifactCount: m.artifacts.length,
          startedAt: m.startedAt,
          completedAt: m.completedAt,
        };
      }),
    });
  } catch (err) {
    console.error("Modules list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
