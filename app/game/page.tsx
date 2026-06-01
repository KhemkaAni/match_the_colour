"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ColorCard, ColorComparison } from "@/components/ColorCard";
import { ColorPicker } from "@/components/ColorPicker";
import { Countdown } from "@/components/Countdown";
import { ScoreDisplay, RunningScore } from "@/components/ScoreDisplay";
import { useGameStore } from "@/store/gameStore";
import { MODE_DISPLAY_TIME, TOTAL_ROUNDS, MAX_SCORE } from "@/lib/types";
import { calculateTotalScore } from "@/lib/scoring";

export default function GamePage() {
  const router = useRouter();
  const {
    playerName,
    mode,
    phase,
    currentRound,
    rounds,
    currentTargetColor,
    startGuess,
    submitGuess,
    nextRound,
    resetGame,
  } = useGameStore();

  const [selectedColor, setSelectedColor] = useState("#808080");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!playerName || phase === "landing")) {
      router.push("/");
    }
  }, [mounted, playerName, phase, router]);

  useEffect(() => {
    if (phase === "final") {
      router.push("/results");
    }
  }, [phase, router]);

  const handleCountdownComplete = useCallback(() => {
    startGuess();
  }, [startGuess]);

  const handleSubmitGuess = () => {
    submitGuess(selectedColor);
  };

  const handleNextRound = () => {
    setSelectedColor("#808080");
    nextRound();
  };

  const handleQuit = () => {
    resetGame();
    router.push("/");
  };

  if (!mounted || !playerName || phase === "landing" || phase === "final") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayTime = MODE_DISPLAY_TIME[mode];
  const currentTotalScore = calculateTotalScore(rounds.map((r) => r.score));
  const lastRound = rounds[rounds.length - 1];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="w-full max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuit}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Quit</span>
          </Button>
          <span className="text-sm font-medium text-muted-foreground capitalize">
            {mode} Mode
          </span>
        </div>
        <RunningScore
          currentRound={currentRound}
          totalRounds={TOTAL_ROUNDS}
          totalScore={currentTotalScore}
          maxScore={MAX_SCORE}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Memorize Phase */}
          {phase === "memorize" && (
            <motion.div
              key="memorize"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <Card className="shadow-xl">
                <CardContent className="pt-6 pb-8">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-1">
                      Round {currentRound}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Memorize this colour!
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <ColorCard color={currentTargetColor} size="lg" />
                    <Countdown
                      seconds={displayTime}
                      onComplete={handleCountdownComplete}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Guess Phase */}
          {phase === "guess" && (
            <motion.div
              key="guess"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <Card className="shadow-xl">
                <CardContent className="pt-6 pb-8">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-1">
                      Round {currentRound}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Recreate the colour from memory!
                    </p>
                  </div>

                  <ColorPicker
                    initialColor="#808080"
                    onChange={setSelectedColor}
                  />

                  <div className="mt-8">
                    <Button
                      onClick={handleSubmitGuess}
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      Submit Guess
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Result Phase */}
          {phase === "result" && lastRound && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg"
            >
              <Card className="shadow-xl">
                <CardContent className="pt-6 pb-8">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-1">
                      Round {currentRound} Results
                    </h2>
                  </div>

                  <ColorComparison
                    targetColor={lastRound.targetColor}
                    guessedColor={lastRound.guessedColor}
                  />

                  <div className="mt-8">
                    <ScoreDisplay
                      accuracy={lastRound.accuracy}
                      score={lastRound.score}
                      deltaE={lastRound.deltaE}
                    />
                  </div>

                  <div className="mt-8">
                    <Button
                      onClick={handleNextRound}
                      className="w-full h-12 text-base gap-2"
                      size="lg"
                    >
                      {currentRound >= TOTAL_ROUNDS ? (
                        "See Final Results"
                      ) : (
                        <>
                          Continue to Round {currentRound + 1}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
