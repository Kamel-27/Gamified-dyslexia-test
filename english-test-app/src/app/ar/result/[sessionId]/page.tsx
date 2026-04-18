import { ResultPageView } from "@/components/result/ResultPageView";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function ArabicResultPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/ar/login");
  }

  return <ResultPageView locale="ar" />;
}
