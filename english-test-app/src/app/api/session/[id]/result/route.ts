import { NextResponse } from "next/server";
import * as memorySessionStore from "@/lib/session-store";
import * as dbSessionStore from "@/lib/db-session-store";

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

  if (!session.result) {
    return NextResponse.json(
      { error: "Session not completed yet." },
      { status: 409 },
    );
  }

  return NextResponse.json({
    sessionId: session.id,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    demographics: session.demographics,
    result: session.result,
  });
}
