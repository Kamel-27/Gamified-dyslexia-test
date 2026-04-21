"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StageShell } from "@/components/screening/StageShell";
import { OptionButton } from "@/components/screening/OptionButton";
import { useScreeningSession } from "@/hooks/useScreeningSession";
import { SCREENING_STAGES, TOTAL_STAGES } from "@/lib/screening/questions";
import type { ScreeningResponse } from "@/lib/screening/types";

export function GenericStage({
  sessionId,
  stageIndex,
  childAge: _childAge,
}: {
  sessionId: string;
  stageIndex: number;
  childAge: number;
}) {
  const stage = SCREENING_STAGES[stageIndex];
  const { submitStageResponses, finalizeExam } = useScreeningSession(sessionId);
  const router = useRouter();
  const stageNum = stageIndex + 1;

  const [qIndex, setQIndex] = useState(0);
  const [allResponses, setAllResponses] = useState<ScreeningResponse[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const startRef = useRef(Date.now());

  const q = stage.questions[qIndex];

  useEffect(() => {
    startRef.current = Date.now();
    if (!q.audioPrompt || typeof window === "undefined") return;

    const utterance = new SpeechSynthesisUtterance(q.audioPrompt);
    utterance.lang = "ar-SA";
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [qIndex, q.audioPrompt]);

  function handleAnswer(idx: number) {
    if (showFeedback) return;

    const ms = Date.now() - startRef.current;
    const result = idx === q.correctIndex ? "correct" : "wrong";
    setChosenIdx(idx);
    setShowFeedback(true);

    const resp: ScreeningResponse = {
      questionId: q.id,
      stageId: stage.id,
      chosenIndex: idx,
      result,
      reactionTimeMs: ms,
      timeLimitSeconds: q.timeLimitSeconds,
    };

    setTimeout(() => {
      void advance([...allResponses, resp]);
    }, 600);
  }

  function handleTimeout() {
    if (showFeedback) return;

    const resp: ScreeningResponse = {
      questionId: q.id,
      stageId: stage.id,
      chosenIndex: null,
      result: "timeout",
      reactionTimeMs: q.timeLimitSeconds * 1000,
      timeLimitSeconds: q.timeLimitSeconds,
    };

    void advance([...allResponses, resp]);
  }

  async function advance(updated: ScreeningResponse[]) {
    setShowFeedback(false);
    setChosenIdx(null);
    setAllResponses(updated);

    if (qIndex + 1 < stage.questions.length) {
      setQIndex((i) => i + 1);
      return;
    }

    await submitStageResponses(updated);

    if (stageNum < TOTAL_STAGES) {
      router.push(`/screening/${sessionId}/stage/${stageNum + 1}`);
      return;
    }

    await finalizeExam();
    router.push(`/screening/${sessionId}/results`);
  }

  const cols =
    q.displayOptions.length <= 2
      ? "grid-cols-2"
      : q.displayOptions.length <= 4
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <StageShell
      key={q.id}
      stageNameAr={stage.nameAr}
      stageNumber={stageNum}
      totalStages={TOTAL_STAGES}
      questionNumber={qIndex + 1}
      totalQuestions={stage.questions.length}
      timeLimitSeconds={q.timeLimitSeconds}
      onTimeout={handleTimeout}
    >
      <p className="text-center text-slate-500 mb-4 text-sm">
        {stage.descriptionAr}
      </p>

      <div className="bg-white border border-slate-200 rounded-2xl px-8 py-10 text-center shadow-sm mb-6">
        <div className="text-4xl font-bold text-indigo-900 leading-relaxed">
          {q.displayArabic}
        </div>
      </div>

      <div className={`grid ${cols} gap-3 mb-4`}>
        {q.displayOptions.map((opt, i) => (
          <OptionButton
            key={i}
            label={opt}
            index={i}
            disabled={showFeedback}
            showFeedback={showFeedback}
            isCorrect={i === q.correctIndex}
            isChosen={i === chosenIdx}
            onClick={handleAnswer}
          />
        ))}
      </div>

      {q.audioPrompt && (
        <div className="text-center">
          <button
            onClick={() => {
              if (typeof window === "undefined") return;
              const utterance = new SpeechSynthesisUtterance(q.audioPrompt!);
              utterance.lang = "ar-SA";
              utterance.rate = 0.85;
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utterance);
            }}
            className="text-sm text-indigo-500 hover:text-indigo-700 underline"
          >
            إعادة الاستماع
          </button>
        </div>
      )}

      {showFeedback && (
        <div
          className={`text-center text-xl font-black mt-4 ${
            chosenIdx === q.correctIndex ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {chosenIdx === q.correctIndex ? "✓ صحيح" : "✗ خطأ"}
        </div>
      )}
    </StageShell>
  );
}
