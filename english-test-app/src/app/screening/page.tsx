"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ScreeningEntryPage() {
  const [age, setAge] = useState<number | null>(null);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ageParam = Number(searchParams.get("age"));
    const langParam = searchParams.get("lang");

    if (Number.isInteger(ageParam) && ageParam >= 7 && ageParam <= 12) {
      setAge(ageParam);
    }

    if (langParam === "ar" || langParam === "en") {
      setLang(langParam);
    }
  }, [searchParams]);

  async function start() {
    if (!age) return;

    setLoading(true);
    try {
      const res = await fetch("/api/screening/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childAge: age, language: lang }),
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const { sessionId } = (await res.json()) as { sessionId: string };
      router.push(`/screening/${sessionId}/stage/1`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-indigo-700 mb-1">Lexora</div>
          <h1 className="text-xl font-bold text-slate-800">فحص الديسلكسيا</h1>
          <p className="text-sm text-slate-500 mt-2">
            اختبار فحص تمهيدي - 20-25 دقيقة
          </p>
        </div>

        <p className="text-sm font-bold text-slate-700 mb-3">عمر الطفل</p>
        <div className="grid grid-cols-6 gap-2 mb-6">
          {[7, 8, 9, 10, 11, 12].map((a) => (
            <button
              key={a}
              onClick={() => setAge(a)}
              className={`py-3 rounded-xl font-bold text-lg transition-all ${
                age === a
                  ? "bg-indigo-600 text-white shadow-md scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <p className="text-sm font-bold text-slate-700 mb-3">لغة الاختبار</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(["ar", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`py-3 rounded-xl font-bold transition-all ${
                lang === l
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {l === "ar" ? "العربية" : "English"}
            </button>
          ))}
        </div>

        <button
          onClick={start}
          disabled={!age || loading}
          className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
        >
          {loading ? "جاري التحضير..." : "ابدأ الاختبار"}
        </button>
      </div>
    </main>
  );
}
