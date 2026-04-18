import { redirect } from "next/navigation";

export default async function EnglishTestEntryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/test/${sessionId}?lang=en`);
}
