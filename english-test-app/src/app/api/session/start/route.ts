import { NextResponse } from "next/server";
import * as memorySessionStore from "@/lib/session-store";
import * as memoryStudentStore from "@/lib/student-store";
import * as dbSessionStore from "@/lib/db-session-store";
import * as dbStudentStore from "@/lib/db-student-store";
import { getAgeGroupForAge, getQuestionIdsForAge } from "@/lib/question-config";
import type { ExamLanguage } from "@/lib/questions";
import { Demographics } from "@/lib/types";

const useDatabase = process.env.USE_DATABASE === "true";

function resolveExamLanguage(value: unknown): ExamLanguage {
  return value === "ar" ? "ar" : "en";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as
      | (Partial<Demographics> & {
          studentId?: string;
          examLanguage?: ExamLanguage;
        })
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid demographics payload." },
        { status: 400 },
      );
    }

    if (typeof body.studentId === "string" && body.studentId.length > 0) {
      const examLanguage = resolveExamLanguage(body.examLanguage);
      const studentStore = useDatabase ? dbStudentStore : memoryStudentStore;
      const sessionStore = useDatabase ? dbSessionStore : memorySessionStore;

      const student = await studentStore.getStudent(body.studentId);
      if (!student) {
        return NextResponse.json(
          { error: "Student not found." },
          { status: 404 },
        );
      }

      const session = await sessionStore.createSessionForStudent(
        student.demographics,
        student.id,
      );

      const ageGroup = getAgeGroupForAge(student.demographics.age);
      const questionIds = getQuestionIdsForAge(student.demographics.age);

      return NextResponse.json({
        sessionId: session.id,
        startedAt: session.startedAt,
        studentId: student.id,
        studentName: student.name,
        ageGroup,
        examLanguage,
        questionIds,
        totalQuestions: questionIds.length,
      });
    }

    const examLanguage = resolveExamLanguage(body.examLanguage);

    if (
      typeof body.age !== "number" ||
      body.age < 7 ||
      body.age > 17 ||
      (body.gender !== "male" && body.gender !== "female") ||
      typeof body.nativeLang !== "boolean" ||
      typeof body.otherLang !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid demographics payload." },
        { status: 400 },
      );
    }

    const sessionStore = useDatabase ? dbSessionStore : memorySessionStore;
    const session = await sessionStore.createSessionForStudent({
      age: body.age,
      gender: body.gender,
      nativeLang: body.nativeLang,
      otherLang: body.otherLang,
    });

    const ageGroup = getAgeGroupForAge(body.age);
    const questionIds = getQuestionIdsForAge(body.age);

    return NextResponse.json({
      sessionId: session.id,
      startedAt: session.startedAt,
      ageGroup,
      examLanguage,
      questionIds,
      totalQuestions: questionIds.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to start test.",
      },
      { status: 500 },
    );
  }
}
