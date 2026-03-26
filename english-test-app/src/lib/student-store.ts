import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import path from "path";
import {
  Demographics,
  StudentAttemptSummary,
  StudentRecord,
  StudentWithAttempts,
} from "@/lib/types";
import { listSessions } from "@/lib/session-store";

const RUNTIME_BASE_DIR =
  process.env.RUNTIME_DATA_DIR?.trim() ||
  (process.env.VERCEL
    ? path.join(os.tmpdir(), "english-test-app")
    : process.cwd());
const STUDENT_DIR = path.join(RUNTIME_BASE_DIR, ".runtime-students");
const STUDENT_FILE = path.join(STUDENT_DIR, "students.json");

type StudentDb = {
  students: StudentRecord[];
};

function ensureStudentDir() {
  if (!existsSync(STUDENT_DIR)) {
    mkdirSync(STUDENT_DIR, { recursive: true });
  }
}

function readDb(): StudentDb {
  try {
    ensureStudentDir();

    if (!existsSync(STUDENT_FILE)) {
      return { students: [] };
    }

    const raw = readFileSync(STUDENT_FILE, "utf-8");
    if (!raw.trim()) {
      return { students: [] };
    }

    const parsed = JSON.parse(raw) as StudentDb;
    return {
      students: Array.isArray(parsed.students) ? parsed.students : [],
    };
  } catch {
    return { students: [] };
  }
}

function writeDb(db: StudentDb) {
  try {
    ensureStudentDir();
    writeFileSync(STUDENT_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // Surface as a consistent API error via route-level handlers.
    throw new Error("Unable to persist student data in runtime storage.");
  }
}

export function createStudent(name: string, demographics: Demographics) {
  const db = readDb();

  const student: StudentRecord = {
    id: randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    demographics,
  };

  db.students.push(student);
  writeDb(db);

  return student;
}

export function getStudent(studentId: string) {
  const db = readDb();
  return db.students.find((student) => student.id === studentId);
}

function mapAttempts(studentId: string): StudentAttemptSummary[] {
  return listSessions()
    .filter((session) => session.studentId === studentId)
    .map((session) => ({
      sessionId: session.id,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      probability: session.result?.probability,
      riskLevel: session.result?.riskLevel,
      riskDetected: session.result?.riskDetected,
    }))
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
}

export function listStudentsWithAttempts(): StudentWithAttempts[] {
  const db = readDb();

  return db.students
    .map((student) => ({
      ...student,
      attempts: mapAttempts(student.id),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
