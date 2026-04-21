import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const result = await db.screeningResult.findUnique({
    where: { sessionId },
    include: { session: { select: { childAge: true, language: true } } },
  });

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...result,
    stageScores: JSON.parse(result.stageScoresJson),
    flaggedStages: JSON.parse(result.flaggedStagesJson),
  });
}
