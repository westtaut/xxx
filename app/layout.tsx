import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Leak Analyzer",
  description:
    "Identify hidden spending leaks, prioritize quick wins, and unlock a concrete plan to improve cash flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
