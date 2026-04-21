import type { ScreeningResult, ScreeningResponse, ScreeningStageScore, ScreeningStageId } from './types'
import { SCREENING_STAGES, WEIGHT_SUM } from './questions'

const RISK = { LOW: 65, MEDIUM: 40 }
const FLAG_THRESHOLD = 40

export function computeScreeningResult(
  sessionId: string,
  responses: ScreeningResponse[],
): ScreeningResult {
  const stageScores: ScreeningStageScore[] = []

  for (const stage of SCREENING_STAGES) {
    const sr = responses.filter(r => r.stageId === stage.id)
    let rawScore = 0, totalMs = 0, timeouts = 0

    for (const resp of sr) {
      const q = stage.questions.find(q => q.id === resp.questionId)
      if (!q) continue
      totalMs += resp.reactionTimeMs
      if (resp.result === 'timeout') { timeouts++; continue }
      if (resp.result === 'correct') {
        const speedRatio = Math.min(1, resp.reactionTimeMs / (q.timeLimitSeconds * 1000))
        rawScore += q.difficultyWeight * (2 - 1.5 * speedRatio)
      }
    }

    const normalized = sr.length > 0 ? Math.min(100, (rawScore / stage.maxRawScore) * 100) : 0
    const normalizedWeight = stage.weight / WEIGHT_SUM

    stageScores.push({
      stageId: stage.id as ScreeningStageId,
      rawScore, maxRawScore: stage.maxRawScore,
      normalizedScore: normalized,
      weightedScore: normalized * normalizedWeight,
      avgReactionMs: sr.length > 0 ? totalMs / sr.length : 0,
      timeoutCount: timeouts,
    })
  }

  const totalScore = stageScores.reduce((s, sc) => s + sc.weightedScore, 0)

  // RAN signal
  const ranAvgMs = stageScores.find(s => s.stageId === 'ran')?.avgReactionMs ?? 0

  // Vowel delta signal (Arabic-specific)
  const veA = responses.filter(r => r.questionId.endsWith('a') && r.stageId === 'vowel_effect')
  const veB = responses.filter(r => r.questionId.endsWith('b') && r.stageId === 'vowel_effect')
  const avg = (arr: ScreeningResponse[]) =>
    arr.length ? arr.reduce((s, r) => s + r.reactionTimeMs, 0) / arr.length : 0
  const vowelDeltaMs = avg(veB) - avg(veA)

  const flaggedStages = stageScores
    .filter(s => s.normalizedScore < FLAG_THRESHOLD)
    .map(s => s.stageId)

  const riskBand = totalScore >= RISK.LOW ? 'low' : totalScore >= RISK.MEDIUM ? 'medium' : 'high'

  return { sessionId, totalScore, riskBand, stageScores, ranAvgMs, vowelDeltaMs, flaggedStages, computedAt: new Date() }
}
