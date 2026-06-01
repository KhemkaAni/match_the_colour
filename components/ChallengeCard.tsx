"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateChallengeUrl } from "@/lib/utils";
import { GameMode, MAX_SCORE } from "@/lib/types";

interface ChallengeCardProps {
  playerName: string;
  score: number;
  mode: GameMode;
  className?: string;
}

export function ChallengeCard({
  playerName,
  score,
  mode,
  className,
}: ChallengeCardProps) {
  const [copied, setCopied] = useState(false);
  const challengeUrl = generateChallengeUrl(playerName, score, mode);

  const getFullUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${challengeUrl}`;
    }
    return challengeUrl;
  };

  const handleCopy = async () => {
    const fullUrl = getFullUrl();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    const fullUrl = getFullUrl();
    const shareData = {
      title: "Colour Memory Challenge",
      text: `Can you beat ${playerName}'s score of ${score}/${MAX_SCORE} in the Colour Memory game?`,
      url: fullUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Trophy className="w-10 h-10 mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Challenge Your Friends!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share your score and see if they can beat it
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleShare}
                variant="default"
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Challenge
              </Button>

              <Button
                onClick={handleCopy}
                variant="outline"
                className="gap-2"
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
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ChallengeMessageProps {
  challengerName: string;
  challengerScore: number;
  mode: string;
  className?: string;
}

export function ChallengeMessage({
  challengerName,
  challengerScore,
  mode,
  className,
}: ChallengeMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("text-center", className)}
    >
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="pt-6">
          <Trophy className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Challenge Received!
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            Can you beat{" "}
            <span className="font-semibold text-foreground">
              {challengerName}&apos;s
            </span>{" "}
            score?
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Score to Beat
              </p>
              <p className="text-4xl font-bold text-amber-500 tabular-nums">
                {challengerScore}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Mode
              </p>
              <p className="text-lg font-medium capitalize">{mode}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
