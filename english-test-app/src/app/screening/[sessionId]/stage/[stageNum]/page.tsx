import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SCREENING_STAGES } from "@/lib/screening/questions";
import { GenericStage } from "./GenericStage";

export default async function StagePage({
  params,
}: {
  params: Promise<{ sessionId: string; stageNum: string }>;
}) {
  const { sessionId, stageNum } = await params;
  const idx = parseInt(stageNum, 10) - 1;

  if (Number.isNaN(idx) || idx < 0 || idx >= SCREENING_STAGES.length) {
    notFound();
  }

  const session = await db.screeningSession.findUnique({
    where: { id: sessionId },
    select: { id: true, childAge: true, isComplete: true },
  });

  if (!session) {
    notFound();
  }

  if (session.isComplete) {
    redirect(`/screening/${sessionId}/results`);
  }

  return (
    <GenericStage
      sessionId={session.id}
      stageIndex={idx}
      childAge={session.childAge}
    />
  );
}
