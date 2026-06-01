"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAccuracyRating } from "@/lib/scoring";

interface ScoreDisplayProps {
  accuracy: number;
  score: number;
  deltaE?: number;
  showRating?: boolean;
  className?: string;
}

export function ScoreDisplay({
  accuracy,
  score,
  deltaE,
  showRating = true,
  className,
}: ScoreDisplayProps) {
  const rating = getAccuracyRating(accuracy);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn("text-center space-y-3", className)}
    >
      {showRating && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl sm:text-2xl font-semibold text-primary"
        >
          {rating}
        </motion.p>
      )}

      <div className="flex items-center justify-center gap-8 sm:gap-12">
        <ScoreItem label="Accuracy" value={`${accuracy}%`} />
        <ScoreItem label="Score" value={score.toString()} />
      </div>

      {deltaE !== undefined && (
        <p className="text-xs text-muted-foreground">
          Color distance (Delta E): {deltaE.toFixed(1)}
        </p>
      )}
    </motion.div>
  );
}

interface ScoreItemProps {
  label: string;
  value: string;
}

function ScoreItem({ label, value }: ScoreItemProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums"
      >
        {value}
      </motion.span>
    </div>
  );
}

interface RunningScoreProps {
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  maxScore: number;
  className?: string;
}

export function RunningScore({
  currentRound,
  totalRounds,
  totalScore,
  maxScore,
  className,
}: RunningScoreProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 bg-muted/30 rounded-lg",
        className
      )}
    >
      <span className="text-sm text-muted-foreground">
        Round {currentRound}/{totalRounds}
      </span>
      <span className="text-sm font-medium">
        Score: <span className="tabular-nums">{totalScore}</span>/{maxScore}
      </span>
    </div>
  );
}
