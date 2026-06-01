"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
  className?: string;
}

export function Countdown({ seconds, onComplete, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleComplete]);

  const progress = ((seconds - timeLeft) / seconds) * 100;

  if (isComplete) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        {/* Circular progress */}
        <svg
          className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={283}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: (progress / 100) * 283 }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums"
            >
              {timeLeft}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Memorize this colour!
      </p>
    </div>
  );
}

interface LinearProgressProps {
  seconds: number;
  className?: string;
}

export function LinearProgress({ seconds, className }: LinearProgressProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground tabular-nums">
        {Math.ceil(timeLeft)}s remaining
      </p>
    </div>
  );
}
