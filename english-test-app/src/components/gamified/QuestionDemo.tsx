"use client";

import { useCallback, useEffect, useState } from "react";
import { speakTextAndWait } from "@/lib/voice";
import { QUESTION_BANK } from "@/lib/questions";
import { Question as QuestionType } from "@/lib/types";
import { useSound } from "@/hooks/useSound";

const DEMO_QUESTIONS = QUESTION_BANK.slice(0, 3);
const QUESTION_DURATION_SECONDS = 15;
const TARGET_REPEAT_COUNT = 3;
const LETTER_POOL = "abcdefghijklmnopqrstuvwxyz";

type RoundStats = {
  clicks: number;
  hits: number;
  misses: number;
};

function normalizeDistractorPool(
  targetToken: string,
  distractorTokens?: string[],
) {
  const sanitized = (distractorTokens ?? [])
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 0 && token !== targetToken.toLowerCase());

  if (sanitized.length > 0) {
    return sanitized;
  }

  if (targetToken.length === 1) {
    return LETTER_POOL.split("").filter(
      (token) => token !== targetToken.toLowerCase(),
    );
  }

  return [
    "pla",
    "bla",
    "gla",
    "glin",
    "glir",
    "gris",
    "gril",
    "glen",
    "grel",
    "glim",
  ];
}

function generateGrid(question: QuestionType) {
  const cellsCount = question.gridSize * question.gridSize;
  const targetToken = question.targetToken.toLowerCase();
  const distractorPool = normalizeDistractorPool(
    targetToken,
    question.distractorTokens,
  );

  const cells = Array.from({ length: cellsCount }, () => {
    const index = Math.floor(Math.random() * distractorPool.length);
    return distractorPool[index];
  });

  const requestedCount = question.targetRepeatCount ?? TARGET_REPEAT_COUNT;
  const targetCount = Math.min(Math.max(requestedCount, 1), cellsCount);
  const targetIndexes = new Set<number>();

  while (targetIndexes.size < targetCount) {
    targetIndexes.add(Math.floor(Math.random() * cellsCount));
  }

  targetIndexes.forEach((targetIndex) => {
    cells[targetIndex] = targetToken;
  });

  return cells;
}

function getGridWidth(gridSize: number) {
  if (gridSize <= 3) {
    return "min(76vw, 380px)";
  }

  if (gridSize === 4) {
    return "min(82vw, 460px)";
  }

  return "min(88vw, 560px)";
}

function getTokenFontSize(tokenLength: number) {
  if (tokenLength >= 8) {
    return "clamp(0.95rem, 1.6vw, 1.25rem)";
  }

  if (tokenLength >= 6) {
    return "clamp(1.02rem, 1.9vw, 1.34rem)";
  }

  if (tokenLength >= 4) {
    return "clamp(1.18rem, 2.2vw, 1.52rem)";
  }

  return "clamp(1.52rem, 3vw, 2.2rem)";
}

function getCellSide(gridSize: number) {
  if (gridSize >= 5) {
    return "min(15.2vw, 6.6rem)";
  }

  if (gridSize === 4) {
    return "min(17.6vw, 7.8rem)";
  }

  return "min(22vw, 9rem)";
}

function getTimeProgress(timeLeft: number) {
  return Math.max(
    0,
    Math.min(100, (timeLeft / QUESTION_DURATION_SECONDS) * 100),
  );
}

export function Question() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<"voice" | "active" | "summary" | "complete">(
    "voice",
  );
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_SECONDS);
  const [gridCells, setGridCells] = useState<string[]>([]);
  const [stats, setStats] = useState<RoundStats>({
    clicks: 0,
    hits: 0,
    misses: 0,
  });
  const [totalHits, setTotalHits] = useState(0);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  const { setMuted, playClick } = useSound();

  const currentQuestion = DEMO_QUESTIONS[questionIndex];
  const totalQuestions = DEMO_QUESTIONS.length;
  const isLastQuestion = questionIndex + 1 === totalQuestions;
  const score = stats.hits;
  const mustRetakeQuestion = stats.clicks === 0;
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((questionIndex + 1) / totalQuestions) * 100)
      : 0;

  useEffect(() => {
    setMuted(false);
  }, [setMuted]);

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    setTimeLeft(QUESTION_DURATION_SECONDS);
    setStats({ clicks: 0, hits: 0, misses: 0 });
    setGridCells(generateGrid(currentQuestion));
    setPhase("voice");
  }, [currentQuestion]);

  useEffect(() => {
    if (!currentQuestion || phase !== "voice") {
      return;
    }

    let active = true;

    async function playPromptVoice() {
      setIsVoicePlaying(true);
      const voiceCompleted = await speakTextAndWait(currentQuestion.audioText);

      if (!active) {
        return;
      }

      if (!voiceCompleted) {
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      if (!active) {
        return;
      }

      setIsVoicePlaying(false);
      setPhase("active");
    }

    void playPromptVoice();

    return () => {
      active = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, phase]);

  useEffect(() => {
    if (phase !== "active") {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          setPhase("summary");
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [phase, timeLeft]);

  const handleAnswerSelect = useCallback(
    (cellToken: string) => {
      if (!currentQuestion || phase !== "active") {
        return;
      }

      playClick();

      const isHit =
        cellToken.toLowerCase() === currentQuestion.targetToken.toLowerCase();

      setStats((previous) => ({
        clicks: previous.clicks + 1,
        hits: previous.hits + (isHit ? 1 : 0),
        misses: previous.misses + (isHit ? 0 : 1),
      }));

      setGridCells(generateGrid(currentQuestion));
    },
    [currentQuestion, phase, playClick],
  );

  const handleRestart = useCallback(() => {
    const firstQuestion = DEMO_QUESTIONS[0];
    setQuestionIndex(0);
    setTotalHits(0);
    setStats({ clicks: 0, hits: 0, misses: 0 });
    setTimeLeft(QUESTION_DURATION_SECONDS);
    setGridCells(firstQuestion ? generateGrid(firstQuestion) : []);
    setIsVoicePlaying(false);
    setPhase("voice");
  }, []);

  const handleContinue = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    if (mustRetakeQuestion) {
      setTimeLeft(QUESTION_DURATION_SECONDS);
      setStats({ clicks: 0, hits: 0, misses: 0 });
      setGridCells(generateGrid(currentQuestion));
      setIsVoicePlaying(false);
      setPhase("voice");
      return;
    }

    setTotalHits((previous) => previous + stats.hits);

    if (isLastQuestion) {
      setPhase("complete");
      return;
    }

    setQuestionIndex((previous) => previous + 1);
  }, [currentQuestion, isLastQuestion, mustRetakeQuestion, stats.hits]);

  const timerProgress = getTimeProgress(timeLeft);
  const timerCircleStyle = {
    background: `conic-gradient(#18a7d3 ${timerProgress}%, #9dd2ea ${timerProgress}% 100%)`,
  };
  const cellSide = currentQuestion
    ? getCellSide(currentQuestion.gridSize)
    : "min(15vw, 7rem)";

  if (!currentQuestion) {
    return (
      <div className="relative min-h-screen bg-slate-900 px-4 py-10 text-white">
        <main className="mx-auto w-full max-w-xl rounded-2xl border border-white/20 bg-black/40 p-6 text-center">
          <p>No demo questions found.</p>
        </main>
      </div>
    );
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/Gemini_background.png')" }}
      />
      <div aria-hidden className="absolute inset-0 bg-black/12" />

      <div className="absolute right-4 top-4 z-20 sm:right-7 sm:top-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full p-1.5"
          style={timerCircleStyle}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-slate-700">
            <span className="text-xl font-semibold leading-none">{score}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center px-3 pb-8 pt-18 sm:px-6 sm:pt-24">
        <div
          className="grid gap-4 sm:gap-5"
          style={{
            width: getGridWidth(currentQuestion.gridSize),
            gridTemplateColumns: `repeat(${currentQuestion.gridSize}, minmax(0, 1fr))`,
          }}
        >
          {gridCells.map((cellToken, cellIndex) => (
            <button
              key={`${cellToken}-${cellIndex}`}
              type="button"
              disabled={phase !== "active"}
              onClick={() => handleAnswerSelect(cellToken)}
              className="rounded-2xl border-[3px] border-[#73a8d9] bg-linear-to-b from-[#eaf5ff] to-[#cfe7ff] text-center font-semibold leading-none text-[#0a5f87] shadow-[inset_0_2px_0_rgba(255,255,255,0.9),0_4px_0_rgba(110,155,196,0.72),0_10px_18px_rgba(0,0,0,0.24)] transition-transform duration-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-75"
              style={{
                width: cellSide,
                height: cellSide,
                fontSize: getTokenFontSize(cellToken.length),
              }}
            >
              {cellToken}
            </button>
          ))}
        </div>
      </div>

      {phase === "voice" ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="rounded-full bg-black/40 px-5 py-2 text-sm font-medium text-white/95 backdrop-blur-sm">
            {isVoicePlaying ? "Reading question..." : "Get ready..."}
          </div>
        </div>
      ) : null}

      {phase === "summary" ? (
        <div className="absolute inset-0 z-35 flex items-center justify-center bg-black/38 px-4">
          <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-white p-8 text-center shadow-xl">
            <p className="text-sm font-medium text-slate-500">
              {currentQuestion.title} complete
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-800">
              You got {score} points
            </h2>
            <p className="mt-2 text-slate-500">Progress: {progressPercent}%</p>

            {mustRetakeQuestion ? (
              <p className="mt-3 text-sm font-medium text-amber-700">
                No clicks were detected. Please retake this question.
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleContinue}
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-sky-300 bg-white px-4 py-3 font-semibold text-sky-700 hover:bg-sky-50"
            >
              {mustRetakeQuestion
                ? "Retake Question"
                : isLastQuestion
                  ? "View Final Result"
                  : "Continue"}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "complete" ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-sky-100/70 bg-white/92 p-6 text-center shadow-xl backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-700">
              Demo Complete
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Final Score: {totalHits}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Questions: {totalQuestions}
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="mt-6 inline-flex rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white hover:bg-cyan-600"
            >
              Restart Demo
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
