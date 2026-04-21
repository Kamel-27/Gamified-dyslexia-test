import { useCallback } from 'react'
import type { ScreeningResponse } from '@/lib/screening/types'

export function useScreeningSession(sessionId: string) {
  const submitStageResponses = useCallback(async (responses: ScreeningResponse[]) => {
    await fetch('/api/screening/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, responses }),
    })
  }, [sessionId])

  const finalizeExam = useCallback(async () => {
    const res = await fetch('/api/screening/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    return res.json() as Promise<{ riskBand: string }>
  }, [sessionId])

  return { submitStageResponses, finalizeExam }
}
