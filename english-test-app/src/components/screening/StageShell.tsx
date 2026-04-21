'use client'
import { useScreeningTimer } from '@/hooks/useScreeningTimer'

interface StageShellProps {
  stageNameAr: string
  stageNumber: number
  totalStages: number
  questionNumber: number
  totalQuestions: number
  timeLimitSeconds: number
  onTimeout: () => void
  children: React.ReactNode
}

export function StageShell({
  stageNameAr, stageNumber, totalStages,
  questionNumber, totalQuestions, timeLimitSeconds, onTimeout, children,
}: StageShellProps) {
  const { remaining, progressPct } = useScreeningTimer(timeLimitSeconds, onTimeout)

  const barColor = progressPct > 60 ? 'bg-emerald-500' : progressPct > 30 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-slate-400">المرحلة {stageNumber} / {totalStages}</p>
              <p className="text-sm font-bold text-slate-800">{stageNameAr}</p>
            </div>
            <div className="text-center">
              <span className={`text-2xl font-black tabular-nums ${
                progressPct < 30 ? 'text-rose-600' : progressPct < 60 ? 'text-amber-600' : 'text-slate-800'
              }`}>{Math.ceil(remaining)}</span>
              <p className="text-xs text-slate-400">ثانية</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">السؤال</p>
              <p className="text-sm font-bold text-slate-800">{questionNumber} / {totalQuestions}</p>
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-100 ${barColor}`}
              style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-center gap-1.5 mt-2">
            {Array.from({ length: totalStages }).map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${
                i + 1 < stageNumber ? 'w-2 h-2 bg-indigo-400' :
                i + 1 === stageNumber ? 'w-4 h-2 bg-indigo-600' : 'w-2 h-2 bg-slate-200'
              }`} />
            ))}
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  )
}
