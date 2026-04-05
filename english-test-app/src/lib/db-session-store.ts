import { db } from "@/lib/db";
import {
  Demographics,
  SessionRecord,
  SessionResult,
  StudentAttemptSummary,
} from "@/lib/types";

type SessionEventInput = {
  eventType: "click" | "hit" | "miss";
  questionId: string;
  optionId?: string;
};

export async function createSessionForStudent(
  demographics: Demographics,
  studentId?: string,
): Promise<SessionRecord> {
  const session = await db.session.create({
    data: {
      demographics: demographics as any,
      studentId,
    },
  });

  return {
    id: session.id,
    startedAt: session.startedAt.toISOString(),
    studentId: session.studentId ?? undefined,
    demographics,
    events: [],
  };
}

export async function getSession(
  id: string,
): Promise<SessionRecord | undefined> {
  const session = await db.session.findUnique({
    where: { id },
    include: { events: true },
  });

  if (!session) {
    return undefined;
  }

  return {
    id: session.id,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString(),
    studentId: session.studentId ?? undefined,
    demographics: session.demographics as Demographics,
    events: session.events.map((event) => ({
      eventType: event.eventType as "click" | "hit" | "miss",
      questionId: event.questionId,
      optionId: event.optionId ?? undefined,
      createdAt: event.createdAt.toISOString(),
    })),
    result: session.result as SessionResult | undefined,
  };
}

export async function addSessionEvent(
  id: string,
  event: SessionEventInput,
): Promise<SessionRecord | undefined> {
  try {
    await db.sessionEvent.create({
      data: {
        sessionId: id,
        eventType: event.eventType,
        questionId: event.questionId,
        optionId: event.optionId,
      },
    });

    return getSession(id);
  } catch (error) {
    return undefined;
  }
}

export async function completeSession(
  id: string,
  result: SessionResult,
): Promise<SessionRecord | undefined> {
  try {
    const session = await db.session.update({
      where: { id },
      data: {
        completedAt: new Date(),
        result: result as any,
      },
      include: { events: true },
    });

    return {
      id: session.id,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString(),
      studentId: session.studentId ?? undefined,
      demographics: session.demographics as Demographics,
      events: session.events.map((event) => ({
        eventType: event.eventType as "click" | "hit" | "miss",
        questionId: event.questionId,
        optionId: event.optionId ?? undefined,
        createdAt: event.createdAt.toISOString(),
      })),
      result: session.result as SessionResult | undefined,
    };
  } catch (error) {
    return undefined;
  }
}

export async function listAttemptSummariesForStudent(
  studentId: string,
): Promise<StudentAttemptSummary[]> {
  const sessions = await db.session.findMany({
    where: { studentId },
    orderBy: { startedAt: "desc" },
  });

  return sessions.map((session) => ({
    sessionId: session.id,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString(),
    probability: (session.result as Record<string, unknown> | null)
      ?.probability as number | undefined,
    riskLevel: (session.result as Record<string, unknown> | null)?.riskLevel as
      | "low"
      | "moderate"
      | "high"
      | undefined,
    riskDetected: (session.result as Record<string, unknown> | null)
      ?.riskDetected as boolean | undefined,
  }));
}
