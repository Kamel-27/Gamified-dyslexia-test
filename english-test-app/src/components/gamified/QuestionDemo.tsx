"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { GamifiedBackground } from "@/components/gamified/GamifiedBackground";
import { XPBar } from "@/components/gamified/XPBar";
import { useGameFeedback } from "@/hooks/useGameFeedback";
import { useSound } from "@/hooks/useSound";

type DemoQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  xp: number;
};

const SAMPLE_QUESTIONS: DemoQuestion[] = [
  {
    id: "dq-1",
    prompt: "Choose the correct spelling:",
    choices: ["beter", "better", "bettar", "battar"],
    answer: "better",
    xp: 15,
  },
  {
    id: "dq-2",
    prompt: "Select the word that rhymes with 'light':",
    choices: ["might", "late", "loot", "list"],
    answer: "might",
    xp: 18,
  },
  {
    id: "dq-3",
    prompt: "Pick the sentence with correct grammar:",
    choices: [
      "She go to school every day.",
      "She goes to school every day.",
      "She going to school every day.",
      "She gone to school every day.",
    ],
    answer: "She goes to school every day.",
    xp: 20,
  },
  {
    id: "dq-4",
    prompt: "Which word has the same vowel sound as 'moon'?",
    choices: ["book", "sun", "blue", "stone"],
    answer: "blue",
    xp: 22,
  },
  {
    id: "dq-5",
    prompt: "Choose the correctly segmented sentence:",
    choices: [
      "wewent toschooltoday",
      "we went to school today",
      "wewent to schooltoday",
      "we wenttoschool today",
    ],
    answer: "we went to school today",
    xp: 25,
  },
];

const XP_PER_LEVEL = 120;

function getChoiceStateClass(
  isSelected: boolean,
  isCorrectChoice: boolean,
  feedback: "idle" | "correct" | "wrong",
) {
  if (!isSelected) {
    return "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/70";
  }

  if (feedback === "correct" && isCorrectChoice) {
    return "answer-feedback-correct border-emerald-400 bg-emerald-50";
  }

  if (feedback === "wrong") {
    return "answer-feedback-wrong border-rose-400 bg-rose-50";
  }

  return "border-cyan-400 bg-cyan-50";
}

export function Question() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const { feedback, floatingXp, triggerCorrect, triggerWrong, resetFeedback } =
    useGameFeedback();
  const { isMuted, toggleMute, playClick, playSuccess, playFail } = useSound();

  const currentQuestion = SAMPLE_QUESTIONS[questionIndex];
  const isComplete = questionIndex >= SAMPLE_QUESTIONS.length;

  const levelState = useMemo(() => {
    const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
    const currentXP = totalXP % XP_PER_LEVEL;
    return {
      level,
      currentXP,
      maxXP: XP_PER_LEVEL,
    };
  }, [totalXP]);

  const handleAnswerSelect = useCallback(
    (choice: string) => {
      if (!currentQuestion || isLocked) {
        return;
      }

      setIsLocked(true);
      setSelectedChoice(choice);
      playClick();

      const isCorrect = choice === currentQuestion.answer;
      if (isCorrect) {
        const streakBonus = Math.min(streak * 2, 8);
        const gainedXP = currentQuestion.xp + streakBonus;

        triggerCorrect(gainedXP);
        playSuccess();
        setTotalXP((previous) => previous + gainedXP);
        setStreak((previous) => {
          const next = previous + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });
      } else {
        triggerWrong();
        playFail();
        setStreak(0);
      }

      window.setTimeout(() => {
        setSelectedChoice(null);
        resetFeedback();
        setIsLocked(false);
        setQuestionIndex((previous) => previous + 1);
      }, 420);
    },
    [
      currentQuestion,
      isLocked,
      playClick,
      playFail,
      playSuccess,
      resetFeedback,
      streak,
      triggerCorrect,
      triggerWrong,
    ],
  );

  const handleRestart = useCallback(() => {
    setQuestionIndex(0);
    setTotalXP(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedChoice(null);
    setIsLocked(false);
    resetFeedback();
  }, [resetFeedback]);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 md:px-8">
      <GamifiedBackground />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-white/85 p-4 shadow-sm backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
              Demo Experience
            </p>
            <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Gamified Question Screen
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>
          </div>
        </header>

        <XPBar
          currentXP={levelState.currentXP}
          maxXP={levelState.maxXP}
          level={levelState.level}
          streak={streak}
        />

        <section className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
          {floatingXp.map((item, index) => (
            <span
              key={item.id}
              className="xp-float pointer-events-none absolute right-4 text-sm font-bold text-emerald-600"
              style={{ top: `${1 + index * 1.2}rem` }}
            >
              +{item.value} XP
            </span>
          ))}

          {!isComplete && currentQuestion ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-2 text-sm text-slate-600">
                <p>
                  Question {questionIndex + 1} / {SAMPLE_QUESTIONS.length}
                </p>
                <p>Best streak: {bestStreak}</p>
              </div>

              <h2 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                {currentQuestion.prompt}
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {currentQuestion.choices.map((choice) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrectChoice = choice === currentQuestion.answer;

                  return (
                    <button
                      key={choice}
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleAnswerSelect(choice)}
                      className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-800 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-90 ${getChoiceStateClass(
                        isSelected,
                        isCorrectChoice,
                        feedback,
                      )}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Demo Complete
              </p>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Final XP: {totalXP}
              </h2>
              <p className="text-sm text-slate-600">
                You reached Level {levelState.level} with a best streak of {bestStreak}.
              </p>

              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
              >
                Restart Demo
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
