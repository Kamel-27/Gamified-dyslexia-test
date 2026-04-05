import { db } from "@/lib/db";
import { listAttemptSummariesForStudent } from "@/lib/db-session-store";
import { Demographics, StudentRecord, StudentWithAttempts } from "@/lib/types";

export async function createStudent(
  name: string,
  demographics: Demographics,
): Promise<StudentRecord> {
  const student = await db.student.create({
    data: {
      name,
      demographics: demographics as any,
    },
  });

  return {
    id: student.id,
    name: student.name,
    demographics: demographics,
    createdAt: student.createdAt.toISOString(),
  };
}

export async function getStudent(id: string): Promise<StudentRecord | undefined> {
  const student = await db.student.findUnique({
    where: { id },
  });

  if (!student) {
    return undefined;
  }

  return {
    id: student.id,
    name: student.name,
    demographics: student.demographics as Demographics,
    createdAt: student.createdAt.toISOString(),
  };
}

export async function listStudentsWithAttempts(): Promise<StudentWithAttempts[]> {
  const students = await db.student.findMany({
    orderBy: { createdAt: "desc" },
  });

  const studentsWithAttempts: StudentWithAttempts[] = await Promise.all(
    students.map(async (student) => ({
      id: student.id,
      name: student.name,
      demographics: student.demographics as Demographics,
      createdAt: student.createdAt.toISOString(),
      attempts: await listAttemptSummariesForStudent(student.id),
    })),
  );

  return studentsWithAttempts;
}
