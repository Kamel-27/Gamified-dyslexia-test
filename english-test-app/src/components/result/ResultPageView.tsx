"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { SessionResult } from "@/lib/types";
import { type AppLocale, isArabicLocale, localePath } from "@/lib/locale";

type ResultPageViewProps = {
  locale?: AppLocale;
};

type ResultResponse = {
  sessionId: string;
  result: SessionResult;
};

const copyByLocale = {
  en: {
    title: "Assessment Result",
    loading: "Loading result...",
    probability: "Probability",
    threshold: "Threshold",
    prediction: "Prediction",
    risk: "Risk",
    riskDetected: "Detected",
    riskNotDetected: "Not Detected",
    source: "Source",
    question: "Question",
    clicks: "Clicks",
    hits: "Hits",
    misses: "Misses",
    score: "Score",
    accuracy: "Accuracy",
    missrate: "Missrate",
    startNew: "Back to Dashboard",
  },
  ar: {
    title: "نتيجة التقييم",
    loading: "جاري تحميل النتيجة...",
    probability: "الاحتمال",
    threshold: "العتبة",
    prediction: "التنبؤ",
    risk: "الخطر",
    riskDetected: "تم الرصد",
    riskNotDetected: "غير مرصود",
    source: "المصدر",
    question: "السؤال",
    clicks: "النقرات",
    hits: "الإصابات",
    misses: "الأخطاء",
    score: "الدرجة",
    accuracy: "الدقة",
    missrate: "معدل الخطأ",
    startNew: "العودة للوحة التحكم",
  },
} as const;

export function ResultPageView({ locale = "en" }: ResultPageViewProps) {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResultResponse | null>(null);

  const isArabic = isArabicLocale(locale);
  const t = copyByLocale[locale];

  useEffect(() => {
    let active = true;

    async function loadResult() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/session/${sessionId}/result`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load result.");
        }

        if (active) {
          setData(payload as ResultResponse);
        }
      } catch (resultError) {
        if (active) {
          setError(
            resultError instanceof Error
              ? resultError.message
              : "Unexpected error.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadResult();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const percentage = useMemo(() => {
    if (!data) {
      return "0.00";
    }

    return (data.result.probability * 100).toFixed(2);
  }, [data]);

  return (
    <main
      className="mx-auto max-w-5xl px-6 py-10"
      dir={isArabic ? "rtl" : "ltr"}
      lang={isArabic ? "ar" : "en"}
    >
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">{t.title}</h1>

        {loading ? <p className="mt-4 text-slate-600">{t.loading}</p> : null}
        {error ? <p className="mt-4 text-red-700">{error}</p> : null}

        {!loading && !error && data ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label={t.probability} value={`${percentage}%`} />
              <StatCard
                label={t.threshold}
                value={data.result.threshold.toFixed(3)}
              />
              <StatCard label={t.prediction} value={data.result.label} />
              <StatCard
                label={t.risk}
                value={
                  data.result.riskDetected ? t.riskDetected : t.riskNotDetected
                }
              />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {t.source}: {data.result.modelSource ?? "fallback"}
              {data.result.modelVersion ? ` (${data.result.modelVersion})` : ""}
            </p>

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-2">{t.question}</th>
                    <th className="px-3 py-2">{t.clicks}</th>
                    <th className="px-3 py-2">{t.hits}</th>
                    <th className="px-3 py-2">{t.misses}</th>
                    <th className="px-3 py-2">{t.score}</th>
                    <th className="px-3 py-2">{t.accuracy}</th>
                    <th className="px-3 py-2">{t.missrate}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.result.metrics.map((metric) => (
                    <tr
                      key={metric.questionId}
                      className="border-b border-slate-100 text-slate-700"
                    >
                      <td className="px-3 py-2 font-medium">
                        {metric.questionId}
                      </td>
                      <td className="px-3 py-2">{metric.clicks}</td>
                      <td className="px-3 py-2">{metric.hits}</td>
                      <td className="px-3 py-2">{metric.misses}</td>
                      <td className="px-3 py-2">{metric.score}</td>
                      <td className="px-3 py-2">
                        {metric.accuracy.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        {metric.missrate.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <div className="mt-8">
          <Link
            href={localePath(locale, "/dashboard")}
            className="inline-flex rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            {t.startNew}
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
