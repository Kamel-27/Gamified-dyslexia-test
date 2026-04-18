import { NextResponse } from "next/server";
import * as memorySessionStore from "@/lib/session-store";
import * as dbSessionStore from "@/lib/db-session-store";
import { getRequestSession } from "@/lib/auth-session";

const useDatabase = process.env.USE_DATABASE === "true";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authSession = await getRequestSession(request);
  if (!authSession) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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
