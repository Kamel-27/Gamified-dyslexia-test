import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    childAge?: number;
    language?: string;
  };

  const childAge = Number(body.childAge);
  if (!Number.isFinite(childAge) || childAge < 7 || childAge > 12) {
    return NextResponse.json({ error: "Invalid age" }, { status: 400 });
  }

  const session = await db.screeningSession.create({
    data: {
      childAge,
      language: body.language === "en" ? "en" : "ar",
    },
  });

  return NextResponse.json({ sessionId: session.id });
}
