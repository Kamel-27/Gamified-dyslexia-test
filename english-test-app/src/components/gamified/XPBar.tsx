"use client";

import { memo } from "react";

type XPBarProps = {
  currentXP: number;
  maxXP: number;
  level: number;
  streak?: number;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function XPBarComponent({
  currentXP,
  maxXP,
  level,
  streak,
  className = "",
}: XPBarProps) {
  const safeMaxXP = Math.max(1, maxXP);
  const safeCurrentXP = clamp(currentXP, 0, safeMaxXP);
  const progress = (safeCurrentXP / safeMaxXP) * 100;

  return (
    <section
      className={`rounded-2xl border border-cyan-200/70 bg-white/85 p-4 shadow-sm backdrop-blur ${className}`}
      aria-label="XP Progress"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">
          Level {level}
        </p>
        {typeof streak === "number" ? (
          <p className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            Streak {streak}
          </p>
        ) : null}
      </div>

      <div
        className="h-4 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMaxXP}
        aria-valuenow={safeCurrentXP}
        aria-label="Current XP"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-emerald-400 via-cyan-400 to-sky-500 transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-sm font-medium text-slate-700">
        {safeCurrentXP} / {safeMaxXP} XP
      </p>
    </section>
  );
}

export const XPBar = memo(XPBarComponent);
