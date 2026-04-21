import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeScreeningResult } from "@/lib/screening/scoring";

export async function POST(request: Request) {
  const body = (await request.json()) as { sessionId?: string };
  const sessionId = body.sessionId;

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const responses = await db.screeningResponse.findMany({
    where: { sessionId },
  });

  const result = computeScreeningResult(sessionId, responses as any);

  await db.screeningResult.create({
    data: {
      sessionId,
      totalScore: result.totalScore,
      riskBand: result.riskBand,
      stageScoresJson: JSON.stringify(result.stageScores),
      ranAvgMs: result.ranAvgMs,
      vowelDeltaMs: result.vowelDeltaMs,
      flaggedStagesJson: JSON.stringify(result.flaggedStages),
    },
  });

  await db.screeningSession.update({
    where: { id: sessionId },
    data: { isComplete: true, completedAt: new Date() },
  });

  return NextResponse.json({ ok: true, riskBand: result.riskBand });
}
