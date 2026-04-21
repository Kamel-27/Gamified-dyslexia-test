import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SCREENING_STAGES } from "@/lib/screening/questions";
import { RiskBadge } from "@/components/screening/RiskBadge";
import type { ScreeningStageScore } from "@/lib/screening/types";

const NEXT_STEPS = {
  low: "لا يوجد ما يدعو للقلق حالياً. يُنصح بالمتابعة الدورية.",
  medium: "تظهر بعض المؤشرات. يُنصح باستشارة معلم متخصص أو أخصائي تعلم.",
  high: "تظهر مؤشرات قوية. يُنصح بالإحالة لأخصائي صعوبات التعلم في أقرب وقت.",
};

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const result = await db.screeningResult.findUnique({
    where: { sessionId },
    include: { session: { select: { childAge: true } } },
  });

  if (!result) {
    notFound();
  }

  const stageScores: ScreeningStageScore[] = JSON.parse(result.stageScoresJson);
  const flagged: string[] = JSON.parse(result.flaggedStagesJson);
  const riskBand = result.riskBand as "low" | "medium" | "high";

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-2xl font-black text-indigo-700 mb-1">Lexora</div>
          <h1 className="text-xl font-bold text-slate-800">
            نتيجة فحص الديسلكسيا
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            الطفل: {result.session.childAge} سنوات
          </p>
        </div>

        <div className="mb-6">
          <RiskBadge riskBand={riskBand} score={result.totalScore} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-slate-800 mb-2">ماذا بعد؟</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {NEXT_STEPS[riskBand]}
          </p>
          <p className="text-xs text-slate-400 mt-3">
            هذا اختبار فحص تمهيدي وليس تشخيصاً طبياً.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-black tabular-nums">
              {Math.round(result.ranAvgMs)}ms
            </div>
            <div className="text-xs text-slate-500 mt-1">متوسط زمن RAN</div>
            <div className="text-xs text-slate-400">
              {result.ranAvgMs > 2000 ? "بطيء" : "طبيعي"}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-black tabular-nums">
              +{Math.round(result.vowelDeltaMs)}ms
            </div>
            <div className="text-xs text-slate-500 mt-1">أثر التشكيل ∆</div>
            <div className="text-xs text-slate-400">
              {result.vowelDeltaMs > 8000 ? "فارق كبير" : "طبيعي"}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">التفصيل بالمراحل</h2>
          <div className="space-y-3">
            {stageScores.map((sc) => {
              const meta = SCREENING_STAGES.find((s) => s.id === sc.stageId);
              return (
                <div key={sc.stageId} className="flex items-center gap-3">
                  <div className="w-36 text-xs font-semibold text-slate-700 text-right shrink-0">
                    {flagged.includes(sc.stageId) && (
                      <span className="text-rose-500 ml-1">⚑</span>
                    )}
                    {meta?.nameAr}
                  </div>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        sc.normalizedScore >= 65
                          ? "bg-emerald-500"
                          : sc.normalizedScore >= 40
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                      style={{ width: `${sc.normalizedScore}%` }}
                    />
                  </div>
                  <div className="w-10 text-xs font-bold text-left shrink-0 tabular-nums">
                    {Math.round(sc.normalizedScore)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href="javascript:window.print()"
            className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-sm text-center"
          >
            طباعة
          </a>
          <a
            href="/dashboard"
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-center hover:bg-indigo-700 text-sm"
          >
            لوحة التحكم
          </a>
        </div>
      </div>
    </div>
  );
}
