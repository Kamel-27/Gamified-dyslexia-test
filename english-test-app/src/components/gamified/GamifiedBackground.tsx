"use client";

import { memo } from "react";

function GamifiedBackgroundComponent() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="gamified-gradient-base absolute inset-0" />
      <div className="gamified-orb gamified-orb-one absolute -left-28 top-[-12%] h-[42vh] w-[42vh] rounded-full" />
      <div className="gamified-orb gamified-orb-two absolute right-[-12%] top-[10%] h-[35vh] w-[35vh] rounded-full" />
      <div className="gamified-orb gamified-orb-three absolute bottom-[-16%] left-[15%] h-[44vh] w-[44vh] rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),rgba(255,255,255,0)_60%)]" />
    </div>
  );
}

export const GamifiedBackground = memo(GamifiedBackgroundComponent);
