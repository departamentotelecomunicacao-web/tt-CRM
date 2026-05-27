import { NextResponse } from "next/server";
import { db } from "@/server/models";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await requireSession();
  const pipelines = await db.pipelines.filter((p) => p.organizationId === s.org);
  pipelines.sort((a, b) => a.order - b.order);
  const allStages = await db.stages.getAll();
  const result = pipelines.map((p) => ({
    ...p,
    stages: allStages
      .filter((st) => st.pipelineId === p.id)
      .sort((a, b) => a.order - b.order),
  }));
  return NextResponse.json({ pipelines: result });
}
