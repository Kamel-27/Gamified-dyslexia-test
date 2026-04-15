from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "sounds"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def write_tone(path: Path, frequencies: list[float], duration_ms: int, volume: float = 0.4) -> None:
    frames = int(SAMPLE_RATE * (duration_ms / 1000))
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)

        for i in range(frames):
            t = i / SAMPLE_RATE
            env = max(0.0, 1.0 - (i / frames) ** 1.2)
            sample = 0.0
            for frequency in frequencies:
                sample += math.sin(2.0 * math.pi * frequency * t)
            sample /= max(len(frequencies), 1)
            sample *= volume * env
            sample = max(-1.0, min(1.0, sample))
            wav_file.writeframes(struct.pack("<h", int(sample * 32767)))


if __name__ == "__main__":
    write_tone(OUTPUT_DIR / "click.wav", [1320.0], duration_ms=45, volume=0.28)
    write_tone(OUTPUT_DIR / "success.wav", [880.0, 1320.0], duration_ms=140, volume=0.26)
    write_tone(OUTPUT_DIR / "fail.wav", [220.0, 180.0], duration_ms=160, volume=0.28)
    print("Generated demo sounds in", OUTPUT_DIR)
