import { LoginPageView } from "@/components/auth/LoginPageView";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function ArabicLoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/ar/dashboard");
  }

  return <LoginPageView locale="ar" />;
}
