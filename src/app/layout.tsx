import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TS in 7 Days — Learn TypeScript by Browsing",
  description:
    "A complete interactive 7-day TypeScript course: lessons with runnable code examples, a real compiler playground, 15 interview questions with model answers, and a cheatsheet. Assumes basic JavaScript.",
  keywords: [
    "TypeScript",
    "learn TypeScript",
    "TypeScript course",
    "TypeScript tutorial",
    "TypeScript interview questions",
    "generics",
    "type narrowing",
  ],
  authors: [{ name: "TS in 7 Days" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TS in 7 Days — Learn TypeScript by Browsing",
    description:
      "Interactive 7-day TypeScript course with a live compiler playground and interview prep.",
    siteName: "TS in 7 Days",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
