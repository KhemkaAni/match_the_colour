"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ColorCardProps {
  color: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showHex?: boolean;
}

const sizeClasses = {
  sm: "w-24 h-24 sm:w-28 sm:h-28",
  md: "w-32 h-32 sm:w-40 sm:h-40",
  lg: "w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72",
};

export function ColorCard({
  color,
  label,
  size = "lg",
  className,
  showHex = false,
}: ColorCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex flex-col items-center gap-3", className)}
    >
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div
        className={cn(
          "rounded-2xl shadow-xl transition-shadow hover:shadow-2xl",
          sizeClasses[size]
        )}
        style={{ backgroundColor: color }}
        role="img"
        aria-label={`Color: ${color}`}
      />
      {showHex && (
        <span className="text-xs font-mono text-muted-foreground uppercase">
          {color}
        </span>
      )}
    </motion.div>
  );
}

interface ColorComparisonProps {
  targetColor: string;
  guessedColor: string;
}

export function ColorComparison({
  targetColor,
  guessedColor,
}: ColorComparisonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
    >
      <ColorCard
        color={targetColor}
        label="Target"
        size="md"
        showHex
      />
      <div className="hidden sm:block text-3xl text-muted-foreground">vs</div>
      <div className="sm:hidden text-xl text-muted-foreground">vs</div>
      <ColorCard
        color={guessedColor}
        label="Your Guess"
        size="md"
        showHex
      />
    </motion.div>
  );
}
