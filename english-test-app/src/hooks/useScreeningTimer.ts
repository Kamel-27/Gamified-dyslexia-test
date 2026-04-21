import { useEffect, useRef, useState, useCallback } from 'react'

export function useScreeningTimer(limitSeconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(limitSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef(Date.now())
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false
    startRef.current = Date.now()
    setRemaining(limitSeconds)
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      const left = Math.max(0, limitSeconds - (Date.now() - startRef.current) / 1000)
      setRemaining(left)
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        clearInterval(intervalRef.current!)
        onExpire()
      }
    }, 100)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [limitSeconds])

  const getElapsedMs = useCallback(() => Date.now() - startRef.current, [])
  return { remaining, progressPct: (remaining / limitSeconds) * 100, getElapsedMs }
}
