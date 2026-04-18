import { NextResponse } from "next/server";
import * as memorySessionStore from "@/lib/session-store";
import * as dbSessionStore from "@/lib/db-session-store";
import { getRequestSession } from "@/lib/auth-session";
import { predictRiskFromFastApi } from "@/lib/fastapi-client";
import { getQuestionIdsForAge } from "@/lib/question-config";
import {
  buildModelFeaturePayload,
  buildQuestionMetrics,
  buildSessionResultFromProbability,
} from "@/lib/scoring";

const useDatabase = process.env.USE_DATABASE === "true";

export async function POST(
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

  const questionIds = getQuestionIdsForAge(session.demographics.age);
  const metrics = buildQuestionMetrics(session.events, questionIds);
  const totalClicks = metrics.reduce(
    (total, metric) => total + metric.clicks,
    0,
  );
  if (totalClicks === 0) {
    return NextResponse.json(
      {
        error:
          "No responses were captured. Please answer the test before finishing.",
      },
      { status: 400 },
    );
  }

  const modelFeatures = buildModelFeaturePayload(session.demographics, metrics);

  let prediction;

  try {
    prediction = await predictRiskFromFastApi({
      session_id: id,
      participant_id: undefined,
      ...modelFeatures,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch model output.";
    return NextResponse.json(
      { error: `Model prediction failed: ${message}` },
      { status: 503 },
    );
  }

  const result = buildSessionResultFromProbability(
    prediction.probability,
    prediction.threshold,
    metrics,
    {
      label: prediction.prediction,
      modelSource: "fastapi",
      modelVersion: prediction.model_version,
    },
  );

  const completed = await sessionStore.completeSession(id, result);

  if (!completed) {
    return NextResponse.json(
      { error: "Unable to complete session." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    sessionId: completed.id,
    completedAt: completed.completedAt,
    result: completed.result,
  });
}
