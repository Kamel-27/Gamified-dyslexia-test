import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lexora - فحص الديسلكسيا" };

export default function ScreeningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen">
      {children}
    </div>
  );
}
