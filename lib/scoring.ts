import { colorDistance } from "./colorUtils";

// Maximum possible Delta E value for normalization
// In practice, the maximum Delta E between any two colors is around 100-150
const MAX_DELTA_E = 100;

// Calculate accuracy percentage from Delta E
export function calculateAccuracy(deltaE: number): number {
  // Normalize Delta E to 0-100 range and invert
  const normalizedDelta = Math.min(deltaE, MAX_DELTA_E);
  const accuracy = Math.max(0, 100 - normalizedDelta);
  return Math.round(accuracy * 10) / 10; // Round to 1 decimal place
}

// Calculate round score from accuracy
export function calculateRoundScore(accuracy: number): number {
  return Math.round(accuracy);
}

// Calculate score from two hex colors
export function calculateScoreFromColors(
  targetHex: string,
  guessHex: string
): { deltaE: number; accuracy: number; score: number } {
  const delta = colorDistance(targetHex, guessHex);
  const accuracy = calculateAccuracy(delta);
  const score = calculateRoundScore(accuracy);

  return {
    deltaE: Math.round(delta * 10) / 10,
    accuracy,
    score,
  };
}

// Calculate total game score
export function calculateTotalScore(roundScores: number[]): number {
  return roundScores.reduce((sum, score) => sum + score, 0);
}

// Calculate average accuracy
export function calculateAverageAccuracy(accuracies: number[]): number {
  if (accuracies.length === 0) return 0;
  const sum = accuracies.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / accuracies.length) * 10) / 10;
}

// Get accuracy rating text
export function getAccuracyRating(accuracy: number): string {
  if (accuracy >= 95) return "Perfect!";
  if (accuracy >= 85) return "Excellent!";
  if (accuracy >= 70) return "Great!";
  if (accuracy >= 55) return "Good";
  if (accuracy >= 40) return "Fair";
  return "Keep practicing!";
}

// Get overall game rating
export function getGameRating(totalScore: number): string {
  if (totalScore >= 475) return "Colour Master!";
  if (totalScore >= 425) return "Excellent Memory!";
  if (totalScore >= 350) return "Great Job!";
  if (totalScore >= 275) return "Good Effort!";
  if (totalScore >= 200) return "Not Bad!";
  return "Keep Practicing!";
}
