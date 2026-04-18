/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");

const source = "src/lib/questions-ar.ts";
const dest = "docs/arabic-questions-and-voice-script.md";

const text = fs.readFileSync(source, "utf8");
const match = text.match(
  /export const QUESTION_BANK_AR: Question\[\] = ([\s\S]*);\s*$/,
);

if (!match) {
  throw new Error(
    "Unable to parse QUESTION_BANK_AR from src/lib/questions-ar.ts",
  );
}

const questions = Function(`return (${match[1]})`)();
const lines = [];

lines.push("# Arabic Questions And Voice Script");
lines.push("");
lines.push(
  "This file lists each Arabic exam question with voice line, correct answer, distractors, and related interaction data.",
);
lines.push("");
lines.push("Source of truth in code: src/lib/questions-ar.ts");
lines.push("");

for (const question of questions) {
  const interactionType = question.interactionType ?? "grid";
  const distractors =
    Array.isArray(question.distractorTokens) &&
    question.distractorTokens.length > 0
      ? question.distractorTokens.join(" | ")
      : "none";

  lines.push(`## ${String(question.id).toUpperCase()} - ${question.title}`);
  lines.push(`- Interaction type: ${interactionType}`);
  lines.push(`- Prompt: ${question.prompt}`);
  lines.push(`- Instruction: ${question.instruction}`);
  lines.push(`- Voice line: ${question.audioText}`);
  lines.push(`- Correct answer (targetToken): ${question.targetToken}`);
  lines.push(`- Distractors: ${distractors}`);

  if (question.visualCue) {
    lines.push(`- Visual cue: ${question.visualCue}`);
  }

  if (typeof question.choiceCount === "number") {
    lines.push(`- Choice count: ${question.choiceCount}`);
  }

  if (typeof question.targetRepeatCount === "number") {
    lines.push(`- Target repeat count: ${question.targetRepeatCount}`);
  }

  if (Array.isArray(question.variants) && question.variants.length > 0) {
    lines.push(`- Variants: ${question.variants.length}`);

    question.variants.forEach((variant, index) => {
      const variantDistractors =
        Array.isArray(variant.distractorTokens) &&
        variant.distractorTokens.length > 0
          ? variant.distractorTokens.join(" | ")
          : "none";
      const cue = variant.visualCue ?? "-";
      const correctionAnswer = variant.correctionTargetToken
        ? ` | correction answer=${variant.correctionTargetToken}`
        : "";
      const correctionDistractors =
        Array.isArray(variant.correctionDistractorTokens) &&
        variant.correctionDistractorTokens.length > 0
          ? ` | correction distractors=${variant.correctionDistractorTokens.join(" | ")}`
          : "";

      lines.push(
        `- Variant ${index + 1}: cue=${cue} | answer=${variant.targetToken} | distractors=${variantDistractors}${correctionAnswer}${correctionDistractors}`,
      );
    });
  }

  lines.push("");
}

lines.push("## Voice Playback Notes");
lines.push("");
lines.push(
  "Current implementation uses browser Text-to-Speech (SpeechSynthesis) with locale selection and voice fallback.",
);
lines.push("");
lines.push("- Arabic exam uses locale ar-SA from the test page.");
lines.push(
  "- App now asks for one explicit Enable Voice click to satisfy browser audio gesture policies.",
);
lines.push(
  "- If no Arabic voice exists on the device, browser fallback voice may be used.",
);
lines.push("");
lines.push("## Quick Checks");
lines.push("");
lines.push(
  "1. Start the test from Dashboard with Arabic selected so URL includes ?lang=ar.",
);
lines.push("2. On the Listen screen, press Enable Voice once.");
lines.push("3. Verify browser tab sound and system sound are not muted.");
lines.push(
  "4. Install an Arabic system/browser TTS voice for best pronunciation.",
);

fs.writeFileSync(dest, lines.join("\n"), "utf8");
