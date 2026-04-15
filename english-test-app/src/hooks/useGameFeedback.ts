"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FeedbackState = "idle" | "correct" | "wrong";

export type FloatingXp = {
  id: number;
  value: number;
};

type UseGameFeedbackOptions = {
  feedbackDurationMs?: number;
  floatingDurationMs?: number;
};

export function useGameFeedback(options: UseGameFeedbackOptions = {}) {
  const feedbackDurationMs = options.feedbackDurationMs ?? 280;
  const floatingDurationMs = options.floatingDurationMs ?? 900;
  type TimerHandle = ReturnType<typeof setTimeout>;

  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [floatingXp, setFloatingXp] = useState<FloatingXp[]>([]);

  const feedbackTimerRef = useRef<TimerHandle | null>(null);
  const floatTimersRef = useRef<Map<number, TimerHandle>>(new Map());
  const nextIdRef = useRef(0);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const scheduleFeedbackReset = useCallback(() => {
    clearFeedbackTimer();
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback("idle");
    }, feedbackDurationMs);
  }, [clearFeedbackTimer, feedbackDurationMs]);

  const removeFloatingXp = useCallback((id: number) => {
    setFloatingXp((previous) => previous.filter((item) => item.id !== id));
    const timer = floatTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      floatTimersRef.current.delete(id);
    }
  }, []);

  const triggerCorrect = useCallback(
    (xpValue = 10) => {
      setFeedback("correct");
      scheduleFeedbackReset();

      if (xpValue <= 0) {
        return;
      }

      const id = ++nextIdRef.current;
      setFloatingXp((previous) => [...previous, { id, value: xpValue }]);

      const timer = setTimeout(() => {
        removeFloatingXp(id);
      }, floatingDurationMs);

      floatTimersRef.current.set(id, timer);
    },
    [floatingDurationMs, removeFloatingXp, scheduleFeedbackReset],
  );

  const triggerWrong = useCallback(() => {
    setFeedback("wrong");
    scheduleFeedbackReset();
  }, [scheduleFeedbackReset]);

  const resetFeedback = useCallback(() => {
    clearFeedbackTimer();
    setFeedback("idle");
    setFloatingXp([]);

    floatTimersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });
    floatTimersRef.current.clear();
  }, [clearFeedbackTimer]);

  useEffect(() => {
    return () => {
      resetFeedback();
    };
  }, [resetFeedback]);

  return {
    feedback,
    floatingXp,
    triggerCorrect,
    triggerWrong,
    resetFeedback,
  };
}
