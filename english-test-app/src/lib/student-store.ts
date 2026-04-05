import { listAttemptSummariesForStudent } from "@/lib/session-store";
import { Demographics, StudentRecord, StudentWithAttempts } from "@/lib/types";

const studentsById = new Map<string, StudentRecord>();

function createId() {
  return globalThis.crypto.randomUUID();
}

export function createStudent(
  name: string,
  demographics: Demographics,
): StudentRecord {
  const student: StudentRecord = {
    id: createId(),
    name,
    demographics,
    createdAt: new Date().toISOString(),
  };

  studentsById.set(student.id, student);
  return student;
}

export function getStudent(id: string): StudentRecord | undefined {
  return studentsById.get(id);
}

export function listStudentsWithAttempts(): StudentWithAttempts[] {
  return Array.from(studentsById.values())
    .map((student) => ({
      ...student,
      attempts: listAttemptSummariesForStudent(student.id),
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
