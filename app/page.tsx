"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Palette, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ModeSelector } from "@/components/ModeSelector";
import { useGameStore } from "@/store/gameStore";
import { GameMode } from "@/lib/types";

export default function LandingPage() {
  const router = useRouter();
  const { playerName, mode, setPlayerName, setMode, startGame } = useGameStore();
  const [name, setName] = useState(playerName);
  const [selectedMode, setSelectedMode] = useState<GameMode>(mode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setName(playerName);
    setSelectedMode(mode);
  }, [playerName, mode]);

  const handleStartGame = () => {
    if (!name.trim()) return;
    setPlayerName(name.trim());
    setMode(selectedMode);
    startGame();
    router.push("/game");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleStartGame();
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center"
              >
                <Palette className="w-8 h-8 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
              >
                How Well Do You
                <br />
                <span className="gradient-text">Remember Colours?</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground"
              >
                Test your colour memory in 5 rounds.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Your Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={20}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <ModeSelector value={selectedMode} onChange={setSelectedMode} />

              <Button
                onClick={handleStartGame}
                disabled={!name.trim()}
                className="w-full gap-2 h-12 text-base"
                size="lg"
              >
                <Play className="w-5 h-5" />
                Start Game
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-muted-foreground mt-6"
            >
              Memorize colours, then recreate them from memory.
              <br />
              Score up to 500 points across 5 rounds!
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
