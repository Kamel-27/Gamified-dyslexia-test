"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExamLanguage } from "@/lib/questions";
import { Demographics, StudentWithAttempts } from "@/lib/types";

type Gender = Demographics["gender"];

type StudentsResponse = {
  students: StudentWithAttempts[];
};

type SessionStartResponse = {
  sessionId?: string;
  error?: string;
  examLanguage?: ExamLanguage;
};

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

export default function DashboardPage() {
  const router = useRouter();
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
    <main className="relative min-h-screen overflow-hidden bg-[#edf6f7] px-6 py-8 text-slate-900">
      <div className="pointer-events-none absolute -left-20 -top-16 h-80 w-80 rounded-full bg-[#0ea5a6]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-96 w-96 rounded-full bg-[#2563eb]/14 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Assessment Console
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
                Students, Sessions, and Bilingual Exam Launch
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                Use the same age grouping and prediction models, then choose if
                each new attempt starts in the English or Arabic exam flow.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to Landing
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Students"
              value={String(dashboardStats.studentsCount)}
            />
            <StatTile
              label="Attempts"
              value={String(dashboardStats.attemptsCount)}
            />
            <StatTile
              label="Completed"
              value={String(dashboardStats.completedCount)}
            />
            <StatTile
              label="Risk Detected"
              value={String(dashboardStats.riskDetected)}
            />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={handleCreateStudent}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Add Student
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Save demographics once, then reuse them for all future attempts.
            </p>

            <div className="mt-4 grid gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  placeholder="Student name"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="age"
                    className="text-sm font-medium text-slate-700"
                  >
                    Age (7-17)
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
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value as Demographics["gender"])
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
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
                  English is native language
                </span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={otherLang}
                  onChange={(event) => setOtherLang(event.target.checked)}
                />
                <span className="text-sm text-slate-700">
                  Speaks another language
                </span>
              </label>

              <div>
                <label
                  htmlFor="preferredExamLanguage"
                  className="text-sm font-medium text-slate-700"
                >
                  Preferred Exam Language
                </label>
                <select
                  id="preferredExamLanguage"
                  value={preferredExamLanguage}
                  onChange={(event) =>
                    setPreferredExamLanguage(event.target.value as ExamLanguage)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Student"}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Existing Students
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select exam language per student before launching a new attempt.
            </p>

            {loading ? (
              <p className="mt-4 text-sm text-slate-600">Loading students...</p>
            ) : null}
            {error ? (
              <p className="mt-4 text-sm text-red-700">{error}</p>
            ) : null}

            {!loading && students.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No students yet. Add your first student from the form.
              </p>
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
                          Age {student.demographics.age} |{" "}
                          {student.demographics.gender} | Native English:{" "}
                          {student.demographics.nativeLang ? "Yes" : "No"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Preferred language: {" "}
                          {student.demographics.preferredExamLanguage === "ar"
                            ? "Arabic"
                            : "English"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Same model and age grouping, different language
                          content.
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
                                ? "bg-cyan-700 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            English Exam
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
                                ? "bg-cyan-700 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            Arabic Exam
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            startAssessment(student.id, selectedLanguage)
                          }
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                          {selectedLanguage === "ar"
                            ? "Start Arabic Test"
                            : "Start English Test"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Previous Results
                      </p>

                      {student.attempts.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600">
                          No attempts yet.
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
                                  ).toLocaleDateString()}
                                </span>
                                <span className="ml-2 text-slate-500">
                                  {attempt.riskDetected === undefined
                                    ? "In progress"
                                    : attempt.riskDetected
                                      ? "Risk detected"
                                      : "No risk"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                {typeof attempt.probability === "number" ? (
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                                    {(attempt.probability * 100).toFixed(1)}%
                                  </span>
                                ) : null}
                                <Link
                                  href={`/result/${attempt.sessionId}`}
                                  className="font-semibold text-cyan-700 hover:text-cyan-600"
                                >
                                  Open result
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
