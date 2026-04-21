import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type SubmitResponse = {
  stageId: string;
  questionId: string;
  chosenIndex: number | null;
  result: string;
  reactionTimeMs: number;
  timeLimitSeconds: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    sessionId?: string;
    responses?: SubmitResponse[];
  };

  if (!body.sessionId || !Array.isArray(body.responses)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const r of body.responses) {
    await db.screeningResponse.create({
      data: {
        sessionId: body.sessionId,
        stageId: r.stageId,
        questionId: r.questionId,
        chosenIndex: r.chosenIndex ?? null,
        result: r.result,
        reactionTimeMs: r.reactionTimeMs,
        timeLimitSeconds: r.timeLimitSeconds,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
