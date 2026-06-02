import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "How Well Do You Know Your Colours?",
  description: "Memorize colours, then recreate them from memory.",
  keywords: ["colour", "memory", "game", "color", "test", "quiz"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased min-h-screen bg-[#0a0a0a] text-white`}>
        <main className="min-h-screen flex flex-col">{children}</main>
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-9Z5RKB3SGE" />
    </html>
  );
}
