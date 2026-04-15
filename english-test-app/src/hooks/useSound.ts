"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SoundKey = "click" | "success" | "fail";

type SoundMap = Record<SoundKey, HTMLAudioElement | null>;

type VolumeMap = Record<SoundKey, number>;

type UseSoundOptions = {
  clickSrc?: string;
  successSrc?: string;
  failSrc?: string;
  volumes?: Partial<VolumeMap>;
  initialMuted?: boolean;
};

const MUTE_STORAGE_KEY = "gamified-audio-muted";
const MUTE_CHANGE_EVENT = "gamified-audio-muted-change";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useSound(options: UseSoundOptions = {}) {
  const sources = useMemo(
    () => ({
      click: options.clickSrc ?? "/sounds/click.wav",
      success: options.successSrc ?? "/sounds/success.wav",
      fail: options.failSrc ?? "/sounds/fail.wav",
    }),
    [options.clickSrc, options.successSrc, options.failSrc],
  );

  const volumes = useMemo<VolumeMap>(
    () => ({
      click: clamp(options.volumes?.click ?? 0.2, 0, 1),
      success: clamp(options.volumes?.success ?? 0.25, 0, 1),
      fail: clamp(options.volumes?.fail ?? 0.22, 0, 1),
    }),
    [options.volumes?.click, options.volumes?.success, options.volumes?.fail],
  );

  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") {
      return options.initialMuted ?? false;
    }

    const persisted = window.localStorage.getItem(MUTE_STORAGE_KEY);
    if (persisted === null) {
      return options.initialMuted ?? false;
    }

    return persisted === "true";
  });

  const audioRef = useRef<SoundMap>({
    click: null,
    success: null,
    fail: null,
  });

  useEffect(() => {
    const clickAudio = new Audio(sources.click);
    const successAudio = new Audio(sources.success);
    const failAudio = new Audio(sources.fail);

    clickAudio.preload = "auto";
    successAudio.preload = "auto";
    failAudio.preload = "auto";

    clickAudio.volume = volumes.click;
    successAudio.volume = volumes.success;
    failAudio.volume = volumes.fail;

    clickAudio.load();
    successAudio.load();
    failAudio.load();

    audioRef.current = {
      click: clickAudio,
      success: successAudio,
      fail: failAudio,
    };

    return () => {
      clickAudio.pause();
      successAudio.pause();
      failAudio.pause();
      audioRef.current = { click: null, success: null, fail: null };
    };
  }, [
    sources.click,
    sources.success,
    sources.fail,
    volumes.click,
    volumes.success,
    volumes.fail,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    window.dispatchEvent(
      new CustomEvent(MUTE_CHANGE_EVENT, { detail: isMuted }),
    );
  }, [isMuted]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== MUTE_STORAGE_KEY || event.newValue === null) {
        return;
      }

      setIsMuted(event.newValue === "true");
    };

    const onMuteChange = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") {
        setIsMuted(detail);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(MUTE_CHANGE_EVENT, onMuteChange as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        MUTE_CHANGE_EVENT,
        onMuteChange as EventListener,
      );
    };
  }, []);

  const play = useCallback(
    (key: SoundKey) => {
      if (isMuted) {
        return;
      }

      const audio = audioRef.current[key];
      if (!audio) {
        return;
      }

      // Restart from the beginning to prevent overlap when users click quickly.
      audio.pause();
      audio.currentTime = 0;
      void audio.play().catch(() => {
        // Ignore autoplay errors; interaction will unlock playback on next click.
      });
    },
    [isMuted],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((previous) => !previous);
  }, []);

  return {
    isMuted,
    setMuted: setIsMuted,
    toggleMute,
    playClick: () => play("click"),
    playSuccess: () => play("success"),
    playFail: () => play("fail"),
  };
}
