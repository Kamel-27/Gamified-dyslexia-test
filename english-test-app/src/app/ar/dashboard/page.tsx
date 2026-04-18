import { DashboardPageView } from "@/components/dashboard/DashboardPageView";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function ArabicDashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/ar/login");
  }

  const userRole = (session.user as { role?: string | null }).role ?? null;

  return (
    <DashboardPageView
      locale="ar"
      userName={session.user.name || session.user.email}
      userRole={userRole}
    />
  );
}
