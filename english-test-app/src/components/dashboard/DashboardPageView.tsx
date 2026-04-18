"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExamLanguage } from "@/lib/questions";
import type { Demographics, StudentWithAttempts } from "@/lib/types";
import {
  type AppLocale,
  isArabicLocale,
  localePath,
  oppositeLocale,
} from "@/lib/locale";

type DashboardPageViewProps = {
  locale?: AppLocale;
  userName?: string;
  userRole?: string | null;
};

type Gender = Demographics["gender"];

type StudentsResponse = {
  students: StudentWithAttempts[];
};

type SessionStartResponse = {
  sessionId?: string;
  error?: string;
  examLanguage?: ExamLanguage;
};

const copyByLocale = {
  en: {
    badge: "Assessment Console",
    title: "Students, Sessions, and Bilingual Exam Launch",
    subtitle:
      "Use the same age grouping and prediction models, then choose if each new attempt starts in the English or Arabic exam flow.",
    backToLanding: "Back to Landing",
    switchLanguage: "العربية",
    signedInAs: "Signed in as",
    rolePerson: "Person account",
    roleAdmin: "Admin account",
    statStudents: "Students",
    statAttempts: "Attempts",
    statCompleted: "Completed",
    statRisk: "Risk Detected",
    addStudent: "Add Student",
    addStudentBody:
      "Save demographics once, then reuse them for all future attempts.",
    fullName: "Full Name",
    age: "Age (7-17)",
    gender: "Gender",
    male: "Male",
    female: "Female",
    nativeEnglish: "English is native language",
    otherLanguage: "Speaks another language",
    preferredLanguage: "Preferred Exam Language",
    english: "English",
    arabic: "Arabic",
    saveStudent: "Save Student",
    saving: "Saving...",
    studentsHeader: "Existing Students",
    studentsBody:
      "Select exam language per student before launching a new attempt.",
    loading: "Loading students...",
    noStudents: "No students yet. Add your first student from the form.",
    preferred: "Preferred language:",
    sameModel: "Same model and age grouping, different language content.",
    englishExam: "English Exam",
    arabicExam: "Arabic Exam",
    startArabic: "Start Arabic Test",
    startEnglish: "Start English Test",
    previousResults: "Previous Results",
    noAttempts: "No attempts yet.",
    inProgress: "In progress",
    riskDetected: "Risk detected",
    noRisk: "No risk",
    openResult: "Open result",
    yes: "Yes",
    no: "No",
    profileRole: "Profile role",
  },
  ar: {
    badge: "لوحة التقييم",
    title: "الطلاب والجلسات وتشغيل الاختبار باللغتين",
    subtitle:
      "استخدم نفس تقسيم الأعمار ونفس النموذج، ثم اختر بدء كل محاولة جديدة بالمسار العربي أو الإنجليزي.",
    backToLanding: "العودة للرئيسية",
    switchLanguage: "English",
    signedInAs: "تسجيل الدخول باسم",
    rolePerson: "حساب شخصي",
    roleAdmin: "حساب مدير",
    statStudents: "الطلاب",
    statAttempts: "المحاولات",
    statCompleted: "المكتملة",
    statRisk: "نتائج خطر",
    addStudent: "إضافة طالب",
    addStudentBody:
      "احفظ البيانات الديموغرافية مرة واحدة ثم أعد استخدامها في كل المحاولات.",
    fullName: "الاسم الكامل",
    age: "العمر (7-17)",
    gender: "النوع",
    male: "ذكر",
    female: "أنثى",
    nativeEnglish: "الإنجليزية هي اللغة الأم",
    otherLanguage: "يتحدث لغة أخرى",
    preferredLanguage: "لغة الاختبار المفضلة",
    english: "الإنجليزية",
    arabic: "العربية",
    saveStudent: "حفظ الطالب",
    saving: "جاري الحفظ...",
    studentsHeader: "الطلاب الحاليون",
    studentsBody: "اختر لغة الاختبار لكل طالب قبل بدء محاولة جديدة.",
    loading: "جاري تحميل الطلاب...",
    noStudents: "لا يوجد طلاب بعد. أضف أول طالب من النموذج.",
    preferred: "اللغة المفضلة:",
    sameModel: "نفس النموذج ونفس فئة العمر مع محتوى مختلف حسب اللغة.",
    englishExam: "اختبار إنجليزي",
    arabicExam: "اختبار عربي",
    startArabic: "ابدأ الاختبار العربي",
    startEnglish: "ابدأ الاختبار الإنجليزي",
    previousResults: "النتائج السابقة",
    noAttempts: "لا توجد محاولات بعد.",
    inProgress: "قيد التنفيذ",
    riskDetected: "تم رصد خطر",
    noRisk: "لا يوجد خطر",
    openResult: "فتح النتيجة",
    yes: "نعم",
    no: "لا",
    profileRole: "دور الحساب",
  },
} as const;

async function parseApiPayload(response: Response) {
  const text = await response.text();
  if (!text.trim()) {
    return {} as { error?: string };
  }

  try {
    return JSON.parse(text) as
      | { error?: string }
      | StudentsResponse
      | { sessionId?: string };
  } catch {
    return { error: "Received an invalid response from the server." };
  }
}

export function DashboardPageView({
  locale = "en",
  userName,
  userRole,
}: DashboardPageViewProps) {
  const router = useRouter();

  const isArabic = isArabicLocale(locale);
  const t = copyByLocale[locale];

  const [students, setStudents] = useState<StudentWithAttempts[]>([]);
  const [examLanguageByStudent, setExamLanguageByStudent] = useState<
    Record<string, ExamLanguage>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState(10);
  const [nativeLang, setNativeLang] = useState(true);
  const [otherLang, setOtherLang] = useState(false);
  const [preferredExamLanguage, setPreferredExamLanguage] =
    useState<ExamLanguage>("en");

  const accountRole = userRole === "admin" ? t.roleAdmin : t.rolePerson;

  async function loadStudents() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/students", { cache: "no-store" });
      const payload = (await parseApiPayload(response)) as
        | StudentsResponse
        | { error?: string };

      if (!response.ok || !("students" in payload)) {
        throw new Error(
          ("error" in payload && payload.error) || "Unable to load students.",
        );
      }

      setStudents(payload.students);
      setExamLanguageByStudent((previous) => {
        const next = { ...previous };

        payload.students.forEach((student) => {
          if (!next[student.id]) {
            next[student.id] =
              student.demographics.preferredExamLanguage ?? "en";
          }
        });

        return next;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unexpected error.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  async function handleCreateStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          demographics: {
            gender,
            age,
            nativeLang,
            otherLang,
            preferredExamLanguage,
          },
        }),
      });

      const payload = (await parseApiPayload(response)) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create student.");
      }

      setName("");
      setPreferredExamLanguage("en");
      await loadStudents();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unexpected error.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function startAssessment(
    studentId: string,
    examLanguage: ExamLanguage,
  ) {
    setError(null);

    try {
      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, examLanguage }),
      });

      const payload = (await parseApiPayload(response)) as SessionStartResponse;
      if (!response.ok || !payload.sessionId) {
        throw new Error(payload.error ?? "Unable to start test.");
      }

      const effectiveLanguage = payload.examLanguage ?? examLanguage;
      const testPath =
        effectiveLanguage === "ar"
          ? `/test/ar/${payload.sessionId}`
          : `/test/en/${payload.sessionId}`;
      router.push(testPath);
    } catch (startError) {
      setError(
        startError instanceof Error ? startError.message : "Unexpected error.",
      );
    }
  }

  const dashboardStats = useMemo(() => {
    const attempts = students.flatMap((student) => student.attempts);
    const finishedAttempts = attempts.filter(
      (attempt) => attempt.riskDetected !== undefined,
    );
    const riskDetected = attempts.filter(
      (attempt) => attempt.riskDetected,
    ).length;

    return {
      studentsCount: students.length,
      attemptsCount: attempts.length,
      completedCount: finishedAttempts.length,
      riskDetected,
    };
  }, [students]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#fafaf9] px-4 py-8 text-slate-900 sm:px-6"
      dir={isArabic ? "rtl" : "ltr"}
      lang={isArabic ? "ar" : "en"}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(199,210,254,0.6),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-20 -top-16 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-cyan-200/45 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-3xl border border-indigo-100 bg-white/90 p-6 shadow-[0_20px_50px_rgba(31,41,55,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                {t.badge}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
                {t.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                {t.subtitle}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.signedInAs}: {userName ?? "User"} - {accountRole}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={localePath(locale, "/")}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {t.backToLanding}
              </Link>
              <Link
                href={localePath(oppositeLocale(locale), "/dashboard")}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                {t.switchLanguage}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label={t.statStudents}
              value={String(dashboardStats.studentsCount)}
            />
            <StatTile
              label={t.statAttempts}
              value={String(dashboardStats.attemptsCount)}
            />
            <StatTile
              label={t.statCompleted}
              value={String(dashboardStats.completedCount)}
            />
            <StatTile
              label={t.statRisk}
              value={String(dashboardStats.riskDetected)}
            />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[370px_1fr]">
          <form
            onSubmit={handleCreateStudent}
            className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {t.addStudent}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t.addStudentBody}</p>

            <div className="mt-4 grid gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  {t.fullName}
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  placeholder={t.fullName}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="age"
                    className="text-sm font-medium text-slate-700"
                  >
                    {t.age}
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={7}
                    max={17}
                    value={age}
                    onChange={(event) => setAge(Number(event.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="text-sm font-medium text-slate-700"
                  >
                    {t.gender}
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value as Demographics["gender"])
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={nativeLang}
                  onChange={(event) => setNativeLang(event.target.checked)}
                />
                <span className="text-sm text-slate-700">
                  {t.nativeEnglish}
                </span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={otherLang}
                  onChange={(event) => setOtherLang(event.target.checked)}
                />
                <span className="text-sm text-slate-700">
                  {t.otherLanguage}
                </span>
              </label>

              <div>
                <label
                  htmlFor="preferredExamLanguage"
                  className="text-sm font-medium text-slate-700"
                >
                  {t.preferredLanguage}
                </label>
                <select
                  id="preferredExamLanguage"
                  value={preferredExamLanguage}
                  onChange={(event) =>
                    setPreferredExamLanguage(event.target.value as ExamLanguage)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                >
                  <option value="en">{t.english}</option>
                  <option value="ar">{t.arabic}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
              >
                {saving ? t.saving : t.saveStudent}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t.studentsHeader}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t.studentsBody}</p>

            {loading ? (
              <p className="mt-4 text-sm text-slate-600">{t.loading}</p>
            ) : null}
            {error ? (
              <p className="mt-4 text-sm text-red-700">{error}</p>
            ) : null}

            {!loading && students.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">{t.noStudents}</p>
            ) : null}

            <div className="mt-4 grid gap-4">
              {students.map((student) => {
                const selectedLanguage =
                  examLanguageByStudent[student.id] ?? "en";

                return (
                  <article
                    key={student.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {student.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {t.age.replace(" (7-17)", "")}:{" "}
                          {student.demographics.age} |{" "}
                          {student.demographics.gender === "male"
                            ? t.male
                            : t.female}{" "}
                          | {t.nativeEnglish}:{" "}
                          {student.demographics.nativeLang ? t.yes : t.no}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t.preferred}{" "}
                          {student.demographics.preferredExamLanguage === "ar"
                            ? t.arabic
                            : t.english}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t.sameModel}
                        </p>
                      </div>

                      <div className="flex flex-col items-stretch gap-2">
                        <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1">
                          <button
                            type="button"
                            onClick={() =>
                              setExamLanguageByStudent((previous) => ({
                                ...previous,
                                [student.id]: "en",
                              }))
                            }
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              selectedLanguage === "en"
                                ? "bg-indigo-700 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {t.englishExam}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExamLanguageByStudent((previous) => ({
                                ...previous,
                                [student.id]: "ar",
                              }))
                            }
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              selectedLanguage === "ar"
                                ? "bg-indigo-700 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {t.arabicExam}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            startAssessment(student.id, selectedLanguage)
                          }
                          className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
                        >
                          {selectedLanguage === "ar"
                            ? t.startArabic
                            : t.startEnglish}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t.previousResults}
                      </p>

                      {student.attempts.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600">
                          {t.noAttempts}
                        </p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {student.attempts.slice(0, 6).map((attempt) => (
                            <div
                              key={attempt.sessionId}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                            >
                              <div className="text-sm text-slate-700">
                                <span className="font-semibold">
                                  {new Date(
                                    attempt.startedAt,
                                  ).toLocaleDateString(
                                    isArabic ? "ar-EG" : "en-US",
                                  )}
                                </span>
                                <span className="ml-2 text-slate-500">
                                  {attempt.riskDetected === undefined
                                    ? t.inProgress
                                    : attempt.riskDetected
                                      ? t.riskDetected
                                      : t.noRisk}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                {typeof attempt.probability === "number" ? (
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                                    {(attempt.probability * 100).toFixed(1)}%
                                  </span>
                                ) : null}
                                <Link
                                  href={localePath(
                                    locale,
                                    `/result/${attempt.sessionId}`,
                                  )}
                                  className="font-semibold text-indigo-700 hover:text-indigo-600"
                                >
                                  {t.openResult}
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
