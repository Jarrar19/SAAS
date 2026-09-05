import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "Flowmetrics — Team productivity and workload analytics",
  description:
    "See where engineering time and effort go across distributed teams with automated workload visibility and sprint capacity planning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-background text-ink antialiased selection:bg-accent selection:text-white">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
