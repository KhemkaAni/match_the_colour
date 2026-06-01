"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Swords, Copy, Check, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModeSelector } from "@/components/ModeSelector";
import { ChallengeMessage } from "@/components/ChallengeCard";
import { useGameStore } from "@/store/gameStore";
import { parseChallengeParams } from "@/lib/utils";
import { GameMode, MAX_SCORE } from "@/lib/types";

function ChallengeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPlayerName, setMode, startGame } = useGameStore();

  const [name, setName] = useState("");
  const [selectedMode, setSelectedMode] = useState<GameMode>("regular");
  const [copied, setCopied] = useState(false);
  const [challenge, setChallenge] = useState<{
    name: string;
    score: number;
    mode: string;
  } | null>(null);

  useEffect(() => {
    const parsed = parseChallengeParams(searchParams);
    if (parsed) {
      setChallenge(parsed);
      setSelectedMode(parsed.mode as GameMode);
    }
  }, [searchParams]);

  const handleAcceptChallenge = () => {
    if (!name.trim()) return;
    setPlayerName(name.trim());
    setMode(selectedMode);
    startGame();
    router.push("/game");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleAcceptChallenge();
    }
  };

  // No valid challenge params
  if (!challenge) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <Card>
            <CardContent className="pt-8 pb-8">
              <h2 className="text-xl font-semibold mb-2">Invalid Challenge</h2>
              <p className="text-muted-foreground mb-6">
                This challenge link appears to be invalid or expired.
              </p>
              <Button onClick={handleGoHome} className="gap-2">
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Challenge Message */}
        <ChallengeMessage
          challengerName={challenge.name}
          challengerScore={challenge.score}
          mode={challenge.mode}
        />

        {/* Accept Challenge Form */}
        <Card className="shadow-xl">
          <CardContent className="pt-6 pb-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Accept the Challenge</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your name and try to beat their score!
              </p>
            </div>

            <div className="space-y-6">
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

              <div className="space-y-3">
                <Button
                  onClick={handleAcceptChallenge}
                  disabled={!name.trim()}
                  className="w-full gap-2 h-12 text-base"
                  size="lg"
                >
                  <Swords className="w-5 h-5" />
                  Accept Challenge
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleGoHome}
                    variant="ghost"
                    className="gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Score up to {MAX_SCORE} points across 5 rounds!
        </p>
      </motion.div>
    </div>
  );
}

export default function ChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChallengeContent />
    </Suspense>
  );
}
