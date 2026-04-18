import { NextResponse } from "next/server";
import * as memoryStudentStore from "@/lib/student-store";
import * as dbStudentStore from "@/lib/db-student-store";
import type { ExamLanguage } from "@/lib/questions";
import { Demographics } from "@/lib/types";

const useDatabase = process.env.USE_DATABASE === "true";

type CreateStudentPayload = {
  name?: string;
  demographics?: Partial<Demographics>;
};

function resolveExamLanguage(value: unknown): ExamLanguage {
  return value === "ar" ? "ar" : "en";
}

export async function GET() {
  try {
    const studentStore = useDatabase ? dbStudentStore : memoryStudentStore;
    const students = await studentStore.listStudentsWithAttempts();
    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load students.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateStudentPayload;
    const demographics = body.demographics;

    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        { error: "Student name is required." },
        { status: 400 },
      );
    }

    if (
      !demographics ||
      typeof demographics.age !== "number" ||
      demographics.age < 7 ||
      demographics.age > 17 ||
      (demographics.gender !== "male" && demographics.gender !== "female") ||
      typeof demographics.nativeLang !== "boolean" ||
      typeof demographics.otherLang !== "boolean" ||
      (demographics.preferredExamLanguage !== undefined &&
        demographics.preferredExamLanguage !== "en" &&
        demographics.preferredExamLanguage !== "ar")
    ) {
      return NextResponse.json(
        { error: "Invalid demographics payload." },
        { status: 400 },
      );
    }

    const studentStore = useDatabase ? dbStudentStore : memoryStudentStore;
    const student = await studentStore.createStudent(body.name.trim(), {
      age: demographics.age,
      gender: demographics.gender,
      nativeLang: demographics.nativeLang,
      otherLang: demographics.otherLang,
      preferredExamLanguage: resolveExamLanguage(
        demographics.preferredExamLanguage,
      ),
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create student.",
      },
      { status: 500 },
    );
  }
}
