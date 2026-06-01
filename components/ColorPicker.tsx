"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { hslToHex, hexToHsl, type HSL } from "@/lib/colorUtils";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  initialColor?: string;
  onChange?: (color: string) => void;
}

export function ColorPicker({
  initialColor = "#808080",
  onChange,
}: ColorPickerProps) {
  const initialHsl = hexToHsl(initialColor);
  const [hsl, setHsl] = useState<HSL>(initialHsl);
  const currentHex = hslToHex(hsl);

  const updateHsl = useCallback(
    (updates: Partial<HSL>) => {
      const newHsl = { ...hsl, ...updates };
      setHsl(newHsl);
      onChange?.(hslToHex(newHsl));
    },
    [hsl, onChange]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      {/* Color Preview */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl shadow-xl transition-all duration-200"
          style={{ backgroundColor: currentHex }}
          role="img"
          aria-label={`Selected color: ${currentHex}`}
        />
        <span className="text-sm font-mono text-muted-foreground uppercase">
          {currentHex}
        </span>
      </div>

      {/* Sliders */}
      <div className="space-y-5 px-2">
        {/* Hue Slider */}
        <SliderControl
          label="Hue"
          value={hsl.h}
          min={0}
          max={359}
          onChange={(h) => updateHsl({ h })}
          gradient="linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
          ariaLabel="Hue slider"
        />

        {/* Saturation Slider */}
        <SliderControl
          label="Saturation"
          value={hsl.s}
          min={0}
          max={100}
          onChange={(s) => updateHsl({ s })}
          gradient={`linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`}
          ariaLabel="Saturation slider"
        />

        {/* Lightness Slider */}
        <SliderControl
          label="Lightness"
          value={hsl.l}
          min={0}
          max={100}
          onChange={(l) => updateHsl({ l })}
          gradient={`linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`}
          ariaLabel="Lightness slider"
        />
      </div>
    </motion.div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  gradient: string;
  ariaLabel: string;
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
  gradient,
  ariaLabel,
}: SliderControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(min + percentage * (max - min));
    },
    [min, max, value]
  );

  const handleMove = useCallback(
    (clientX: number) => {
      const newValue = calculateValue(clientX);
      onChange(newValue);
    },
    [calculateValue, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(min, value - step));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, value + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {value}
        </span>
      </div>
      <div
        ref={trackRef}
        className={cn(
          "relative h-8 rounded-lg cursor-pointer touch-none select-none",
          "ring-offset-background transition-shadow",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        )}
        style={{
          background: gradient,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Track border */}
        <div className="absolute inset-0 rounded-lg border border-border/50" />

        {/* Thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full",
            "bg-white border-2 border-foreground/20 shadow-lg",
            "transition-transform",
            isDragging && "scale-110"
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
