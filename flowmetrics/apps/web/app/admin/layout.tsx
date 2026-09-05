import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flowmetrics Admin CMS",
  description: "Content and pricing management for Flowmetrics SaaS",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-ink antialiased">
      {children}
    </div>
  );
}
