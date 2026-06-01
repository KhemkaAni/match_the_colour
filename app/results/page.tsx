"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RotateCcw, Trophy, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChallengeCard } from "@/components/ChallengeCard";
import { useGameStore } from "@/store/gameStore";
import { getGameRating } from "@/lib/scoring";
import { MAX_SCORE } from "@/lib/types";
import { formatOrdinal } from "@/lib/utils";

export default function ResultsPage() {
  const router = useRouter();
  const { getGameResult, resetGame } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const result = getGameResult();

  useEffect(() => {
    if (mounted && !result) {
      router.push("/");
    }
  }, [mounted, result, router]);

  const handlePlayAgain = () => {
    resetGame();
    router.push("/");
  };

  if (!mounted || !result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rating = getGameRating(result.totalScore);

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-6"
      >
        {/* Main Results Card */}
        <Card className="shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold"
            >
              {rating}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mt-1"
            >
              Great job, {result.playerName}!
            </motion.p>
          </div>

          <CardContent className="pt-6 pb-8">
            {/* Total Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1">
                Total Score
              </p>
              <p className="text-5xl sm:text-6xl font-bold tabular-nums">
                <span className="gradient-text">{result.totalScore}</span>
                <span className="text-2xl text-muted-foreground">/{MAX_SCORE}</span>
              </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              <StatCard
                icon={<Target className="w-5 h-5" />}
                label="Average Accuracy"
                value={`${result.averageAccuracy}%`}
              />
              <StatCard
                icon={<Trophy className="w-5 h-5" />}
                label="Mode"
                value={result.mode.charAt(0).toUpperCase() + result.mode.slice(1)}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-green-500" />}
                label="Best Round"
                value={formatOrdinal(result.bestRound)}
              />
              <StatCard
                icon={<TrendingDown className="w-5 h-5 text-orange-500" />}
                label="Worst Round"
                value={formatOrdinal(result.worstRound)}
              />
            </motion.div>

            {/* Round Breakdown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Round Breakdown
              </h3>
              <div className="space-y-2">
                {result.rounds.map((round, index) => (
                  <RoundResult
                    key={index}
                    roundNumber={round.roundNumber}
                    targetColor={round.targetColor}
                    guessedColor={round.guessedColor}
                    accuracy={round.accuracy}
                    score={round.score}
                    isBest={round.roundNumber === result.bestRound}
                    isWorst={round.roundNumber === result.worstRound}
                  />
                ))}
              </div>
            </motion.div>

            {/* Play Again Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={handlePlayAgain}
                className="w-full h-12 text-base gap-2"
                size="lg"
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Challenge Card */}
        <ChallengeCard
          playerName={result.playerName}
          score={result.totalScore}
          mode={result.mode}
        />
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="p-4 rounded-xl bg-muted/30 text-center">
      <div className="flex justify-center mb-2 text-muted-foreground">{icon}</div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

interface RoundResultProps {
  roundNumber: number;
  targetColor: string;
  guessedColor: string;
  accuracy: number;
  score: number;
  isBest: boolean;
  isWorst: boolean;
}

function RoundResult({
  roundNumber,
  targetColor,
  guessedColor,
  accuracy,
  score,
  isBest,
  isWorst,
}: RoundResultProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <span className="text-sm font-medium text-muted-foreground w-8">
        #{roundNumber}
      </span>
      <div className="flex items-center gap-1">
        <div
          className="w-6 h-6 rounded-md shadow-sm"
          style={{ backgroundColor: targetColor }}
          title={`Target: ${targetColor}`}
        />
        <span className="text-muted-foreground">→</span>
        <div
          className="w-6 h-6 rounded-md shadow-sm"
          style={{ backgroundColor: guessedColor }}
          title={`Guess: ${guessedColor}`}
        />
      </div>
      <div className="flex-1 text-right">
        <span className="text-sm font-medium tabular-nums">{accuracy}%</span>
        <span className="text-xs text-muted-foreground ml-2">({score} pts)</span>
      </div>
      {isBest && (
        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
          Best
        </span>
      )}
      {isWorst && !isBest && (
        <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">
          Worst
        </span>
      )}
    </div>
  );
}
