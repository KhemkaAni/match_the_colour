import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "How Well Do You Remember Colours?",
  description:
    "Test your colour memory in 5 rounds. Memorize colours and try to recreate them from memory!",
  keywords: ["colour", "memory", "game", "color", "test", "quiz"],
  authors: [{ name: "Colour Memory Game" }],
  openGraph: {
    title: "How Well Do You Remember Colours?",
    description: "Test your colour memory in 5 rounds!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main className="min-h-screen flex flex-col">{children}</main>
      </body>
    </html>
  );
}
