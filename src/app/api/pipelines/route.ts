import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

export async function GET() {
  const s = await requireSession();
  const pipelines = await prisma.pipeline.findMany({
    where: { organizationId: s.org },
    orderBy: { order: "asc" },
    include: {
      stages: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json({ pipelines });
}
