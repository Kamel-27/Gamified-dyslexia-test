import { SignupPageView } from "@/components/auth/SignupPageView";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function ArabicSignupPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/ar/dashboard");
  }

  return <SignupPageView locale="ar" />;
}
