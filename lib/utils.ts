import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate challenge URL
export function generateChallengeUrl(
  name: string,
  score: number,
  mode: string
): string {
  const params = new URLSearchParams({
    name: encodeURIComponent(name),
    score: score.toString(),
    mode,
  });
  return `/challenge?${params.toString()}`;
}

// Parse challenge URL params
export function parseChallengeParams(searchParams: URLSearchParams): {
  name: string;
  score: number;
  mode: string;
} | null {
  const name = searchParams.get("name");
  const score = searchParams.get("score");
  const mode = searchParams.get("mode");

  if (!name || !score || !mode) {
    return null;
  }

  const parsedScore = parseInt(score, 10);
  if (isNaN(parsedScore)) {
    return null;
  }

  return {
    name: decodeURIComponent(name),
    score: parsedScore,
    mode,
  };
}

// Format number with ordinal suffix
export function formatOrdinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}
