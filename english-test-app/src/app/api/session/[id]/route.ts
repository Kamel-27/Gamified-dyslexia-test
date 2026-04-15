import { NextResponse } from "next/server";
import * as memorySessionStore from "@/lib/session-store";
import * as dbSessionStore from "@/lib/db-session-store";
import { getAgeGroupForAge, getQuestionIdsForAge } from "@/lib/question-config";

const useDatabase = process.env.USE_DATABASE === "true";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sessionStore = useDatabase ? dbSessionStore : memorySessionStore;
  const session = await sessionStore.getSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const ageGroup = getAgeGroupForAge(session.demographics.age);
  if (!ageGroup) {
    return NextResponse.json(
      { error: "Session age is out of supported range (7-17)." },
      { status: 400 },
    );
  }

  const questionIds = getQuestionIdsForAge(session.demographics.age);

  return NextResponse.json({
    sessionId: session.id,
    startedAt: session.startedAt,
    studentId: session.studentId,
    demographics: session.demographics,
    ageGroup,
    questionIds,
    totalQuestions: questionIds.length,
  });
}
