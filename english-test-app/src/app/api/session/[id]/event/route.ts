import { NextResponse } from "next/server";
import * as memorySessionStore from "@/lib/session-store";
import * as dbSessionStore from "@/lib/db-session-store";
import { getRequestSession } from "@/lib/auth-session";
import { SessionEventType } from "@/lib/types";

const useDatabase = process.env.USE_DATABASE === "true";

function isValidEventType(value: string): value is SessionEventType {
  return value === "click" || value === "hit" || value === "miss";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authSession = await getRequestSession(request);
  if (!authSession) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    eventType?: string;
    questionId?: string;
    optionId?: string;
  };

  if (
    !body ||
    !body.questionId ||
    typeof body.questionId !== "string" ||
    !body.eventType ||
    !isValidEventType(body.eventType)
  ) {
    return NextResponse.json(
      { error: "Invalid event payload." },
      { status: 400 },
    );
  }

  const sessionStore = useDatabase ? dbSessionStore : memorySessionStore;
  const updated = await sessionStore.addSessionEvent(id, {
    questionId: body.questionId,
    optionId: body.optionId,
    eventType: body.eventType,
  });

  if (!updated) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    eventsCount: updated.events.length,
  });
}
