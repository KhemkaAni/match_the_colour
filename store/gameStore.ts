"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GameMode,
  GamePhase,
  Round,
  GameResult,
  TOTAL_ROUNDS,
} from "@/lib/types";
import { generateRandomColor } from "@/lib/colorUtils";
import {
  calculateScoreFromColors,
  calculateTotalScore,
  calculateAverageAccuracy,
} from "@/lib/scoring";

interface GameState {
  // Player info
  playerName: string;
  mode: GameMode;

  // Game state
  phase: GamePhase;
  currentRound: number;
  rounds: Round[];
  currentTargetColor: string;

  // Actions
  setPlayerName: (name: string) => void;
  setMode: (mode: GameMode) => void;
  startGame: () => void;
  startMemorize: () => void;
  startGuess: () => void;
  submitGuess: (guessedColor: string) => void;
  nextRound: () => void;
  finishGame: () => void;
  resetGame: () => void;
  getGameResult: () => GameResult | null;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      playerName: "",
      mode: "regular",
      phase: "landing",
      currentRound: 0,
      rounds: [],
      currentTargetColor: "",

      // Actions
      setPlayerName: (name) => set({ playerName: name }),

      setMode: (mode) => set({ mode }),

      startGame: () => {
        const targetColor = generateRandomColor();
        set({
          phase: "memorize",
          currentRound: 1,
          rounds: [],
          currentTargetColor: targetColor,
        });
      },

      startMemorize: () => {
        const targetColor = generateRandomColor();
        set({
          phase: "memorize",
          currentTargetColor: targetColor,
        });
      },

      startGuess: () => {
        set({ phase: "guess" });
      },

      submitGuess: (guessedColor) => {
        const state = get();
        const { deltaE, accuracy, score } = calculateScoreFromColors(
          state.currentTargetColor,
          guessedColor
        );

        const newRound: Round = {
          roundNumber: state.currentRound,
          targetColor: state.currentTargetColor,
          guessedColor,
          accuracy,
          score,
          deltaE,
        };

        set({
          rounds: [...state.rounds, newRound],
          phase: "result",
        });
      },

      nextRound: () => {
        const state = get();
        if (state.currentRound >= TOTAL_ROUNDS) {
          set({ phase: "final" });
        } else {
          const targetColor = generateRandomColor();
          set({
            currentRound: state.currentRound + 1,
            currentTargetColor: targetColor,
            phase: "memorize",
          });
        }
      },

      finishGame: () => {
        set({ phase: "final" });
      },

      resetGame: () => {
        set({
          phase: "landing",
          currentRound: 0,
          rounds: [],
          currentTargetColor: "",
        });
      },

      getGameResult: () => {
        const state = get();
        if (state.rounds.length === 0) return null;

        const scores = state.rounds.map((r) => r.score);
        const accuracies = state.rounds.map((r) => r.accuracy);

        const bestRoundIndex = scores.indexOf(Math.max(...scores));
        const worstRoundIndex = scores.indexOf(Math.min(...scores));

        return {
          playerName: state.playerName,
          mode: state.mode,
          rounds: state.rounds,
          totalScore: calculateTotalScore(scores),
          averageAccuracy: calculateAverageAccuracy(accuracies),
          bestRound: bestRoundIndex + 1,
          worstRound: worstRoundIndex + 1,
        };
      },
    }),
    {
      name: "colour-game-storage",
      partialize: (state) => ({
        playerName: state.playerName,
        mode: state.mode,
      }),
    }
  )
);
