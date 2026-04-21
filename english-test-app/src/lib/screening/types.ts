export type ScreeningStageId =
  | "letter_confusion"
  | "ran"
  | "phonological_awareness"
  | "pseudowords"
  | "working_memory"
  | "vowel_effect"
  | "visual_attention"
  | "morphology"
  | "letter_position";

export type AnswerResult = "correct" | "wrong" | "timeout";

export interface ScreeningQuestion {
  id: string;
  stageId: ScreeningStageId;
  audioPrompt?: string;
  displayArabic?: string;
  displayOptions: string[];
  correctIndex: number; // -1 for working memory (sequence-based)
  timeLimitSeconds: number;
  difficultyWeight: number; // 1.0 | 1.5 | 2.0
}

export interface ScreeningStageConfig {
  id: ScreeningStageId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  weight: number;
  maxRawScore: number;
  questions: ScreeningQuestion[];
}

export interface ScreeningResponse {
  questionId: string;
  stageId: ScreeningStageId;
  chosenIndex: number | null;
  result: AnswerResult;
  reactionTimeMs: number;
  timeLimitSeconds: number;
}

export interface ScreeningStageScore {
  stageId: ScreeningStageId;
  rawScore: number;
  maxRawScore: number;
  normalizedScore: number;
  weightedScore: number;
  avgReactionMs: number;
  timeoutCount: number;
}

export interface ScreeningResult {
  sessionId: string;
  totalScore: number;
  riskBand: "low" | "medium" | "high";
  stageScores: ScreeningStageScore[];
  ranAvgMs: number;
  vowelDeltaMs: number;
  flaggedStages: ScreeningStageId[];
  computedAt: Date;
}
