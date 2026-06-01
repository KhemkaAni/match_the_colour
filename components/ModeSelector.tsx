"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameMode, MODE_DISPLAY_TIME } from "@/lib/types";

interface ModeSelectorProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  className?: string;
}

export function ModeSelector({ value, onChange, className }: ModeSelectorProps) {
  const modes: { id: GameMode; label: string; description: string }[] = [
    {
      id: "regular",
      label: "Regular",
      description: `${MODE_DISPLAY_TIME.regular}s to memorize`,
    },
    {
      id: "hard",
      label: "Hard",
      description: `${MODE_DISPLAY_TIME.hard}s to memorize`,
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">
        Select Difficulty
      </label>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <ModeButton
            key={mode.id}
            selected={value === mode.id}
            onClick={() => onChange(mode.id)}
            label={mode.label}
            description={mode.description}
          />
        ))}
      </div>
    </div>
  );
}

interface ModeButtonProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
}

function ModeButton({ selected, onClick, label, description }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-4 py-3 rounded-xl border-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {selected && (
        <motion.div
          layoutId="mode-selected"
          className="absolute inset-0 rounded-xl bg-primary/10"
          transition={{ type: "spring", duration: 0.3 }}
        />
      )}
      <div className="relative">
        <span className="font-medium">{label}</span>
        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{description}</span>
        </div>
      </div>
    </button>
  );
}
