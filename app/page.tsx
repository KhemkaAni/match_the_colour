"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ------------------------------------------------------------------ */
/* Colour utilities (ported from index.html)                           */
/* ------------------------------------------------------------------ */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): Rgb {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToLab(rgb: Rgb): { l: number; a: number; b: number } {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;
  let xr = x / refX;
  let yr = y / refY;
  let zr = z / refZ;

  const epsilon = 0.008856;
  const kappa = 903.3;
  xr = xr > epsilon ? Math.pow(xr, 1 / 3) : (kappa * xr + 16) / 116;
  yr = yr > epsilon ? Math.pow(yr, 1 / 3) : (kappa * yr + 16) / 116;
  zr = zr > epsilon ? Math.pow(zr, 1 / 3) : (kappa * zr + 16) / 116;

  return { l: 116 * yr - 16, a: 500 * (xr - yr), b: 200 * (yr - zr) };
}

function deltaE(hex1: string, hex2: string): number {
  const lab1 = rgbToLab(hexToRgb(hex1));
  const lab2 = rgbToLab(hexToRgb(hex2));
  return Math.sqrt(
    Math.pow(lab1.l - lab2.l, 2) +
      Math.pow(lab1.a - lab2.a, 2) +
      Math.pow(lab1.b - lab2.b, 2)
  );
}

function generateRandomColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 50 + Math.floor(Math.random() * 40);
  const l = 35 + Math.floor(Math.random() * 35);
  return hslToHex(h, s, l);
}

function getTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

function calculateScore(targetHex: string, guessHex: string) {
  const delta = deltaE(targetHex, guessHex);
  const accuracy = Math.max(0, 100 - Math.min(delta, 100));
  return { accuracy: Math.round(accuracy), score: Math.round(accuracy) };
}

function getRating(accuracy: number): string {
  if (accuracy >= 95) return "Perfect";
  if (accuracy >= 85) return "Excellent";
  if (accuracy >= 70) return "Great";
  if (accuracy >= 55) return "Good";
  if (accuracy >= 40) return "Close";
  return "Keep trying";
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Mode = "regular" | "hard";
type Screen = "landing" | "memorize" | "guess" | "result" | "final" | "challenge";

interface Round {
  targetColor: string;
  guessedColor: string;
  accuracy: number;
  score: number;
}

interface ChallengeData {
  name: string;
  score: number;
  mode: Mode;
}

const TOTAL_ROUNDS = 5;
const MAX_SCORE = 500;

/* ------------------------------------------------------------------ */
/* Slider (pointer-based, mirrors index.html drag behaviour)           */
/* ------------------------------------------------------------------ */

function Slider({
  value,
  min,
  max,
  onChange,
  className,
  style,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  const computeValue = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return value;
      const rect = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(min + p * (max - min));
    },
    [min, max, value]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    onChange(computeValue(e.clientX));

    const move = (ev: PointerEvent) => onChange(computeValue(ev.clientX));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={trackRef}
      className={`slider-track ${className ?? ""}`}
      style={style}
      onPointerDown={handlePointerDown}
    >
      <div className="slider-thumb" style={{ left: `${pct}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<Screen>("landing");
  const [playerName, setPlayerName] = useState("");
  const [mode, setMode] = useState<Mode>("regular");
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [targetColor, setTargetColor] = useState("");
  const [countdown, setCountdown] = useState(6);
  const [hue, setHue] = useState(0);
  const [intensity, setIntensity] = useState(50);
  const [lastGuess, setLastGuess] = useState("");
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [copied, setCopied] = useState(false);

  // On mount: check for a challenge link, otherwise restore saved name.
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    if (params.has("name") && params.has("score") && params.has("mode")) {
      const name = decodeURIComponent(params.get("name") ?? "");
      const score = parseInt(params.get("score") ?? "", 10);
      const m = params.get("mode");
      if (!Number.isNaN(score) && (m === "regular" || m === "hard")) {
        setChallenge({ name, score, mode: m });
        setMode(m);
        setScreen("challenge");
        const saved = localStorage.getItem("playerName");
        if (saved) setPlayerName(saved);
        return;
      }
    }
    const saved = localStorage.getItem("playerName");
    if (saved) setPlayerName(saved);
  }, []);

  // Memorize countdown.
  useEffect(() => {
    if (screen !== "memorize") return;
    const total = mode === "hard" ? 3 : 6;
    setCountdown(total);
    let t = total;
    const id = setInterval(() => {
      t -= 1;
      if (t <= 0) {
        clearInterval(id);
        setCountdown(0);
        setHue(0);
        setIntensity(50);
        setScreen("guess");
      } else {
        setCountdown(t);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [screen, currentRound, mode]);

  const beginGame = () => {
    if (!playerName.trim()) return;
    const trimmed = playerName.trim();
    localStorage.setItem("playerName", trimmed);
    setPlayerName(trimmed);
    setRounds([]);
    setCurrentRound(1);
    setTargetColor(generateRandomColor());
    setScreen("memorize");
  };

  const acceptChallenge = () => {
    if (!playerName.trim()) return;
    const trimmed = playerName.trim();
    localStorage.setItem("playerName", trimmed);
    setPlayerName(trimmed);
    window.history.replaceState({}, "", window.location.pathname);
    setChallenge(null);
    setRounds([]);
    setCurrentRound(1);
    setTargetColor(generateRandomColor());
    setScreen("memorize");
  };

  const quitGame = () => {
    setScreen("landing");
  };

  // Guess colour derived from the two sliders.
  const guessSat = 50 + intensity / 2;
  const guessLight = 30 + intensity * 0.4;
  const guessColor = hslToHex(hue, guessSat, guessLight);

  const submitGuess = () => {
    const guess = guessColor;
    const { accuracy, score } = calculateScore(targetColor, guess);
    setRounds((rs) => [
      ...rs,
      { targetColor, guessedColor: guess, accuracy, score },
    ]);
    setLastGuess(guess);
    setScreen("result");
  };

  const proceed = () => {
    if (currentRound >= TOTAL_ROUNDS) {
      setScreen("final");
    } else {
      setCurrentRound((r) => r + 1);
      setTargetColor(generateRandomColor());
      setScreen("memorize");
    }
  };

  const playAgain = () => {
    setRounds([]);
    setCurrentRound(1);
    setScreen("landing");
  };

  const totalScore = rounds.reduce((sum, r) => sum + r.score, 0);
  const avgAccuracy =
    rounds.length === 0
      ? 0
      : Math.round(rounds.reduce((sum, r) => sum + r.accuracy, 0) / rounds.length);

  const challengeUrl =
    mounted && typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(
          playerName
        )}&score=${totalScore}&mode=${mode}`
      : "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareChallenge = async () => {
    const shareData = {
      title: "Colour Memory Challenge",
      text: `I scored ${totalScore}/${MAX_SCORE} on the Colour Memory game. Think you can beat me?`,
      url: challengeUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          copyToClipboard(challengeUrl);
        }
      }
    } else {
      copyToClipboard(challengeUrl);
    }
  };

  if (!mounted) return null;

  /* ----------------------------- Landing ---------------------------- */
  if (screen === "landing") {
    return (
      <div id="landing" className="cmg animate-in">
        <div className="landing-content">
          <h1>How well do you know your colours?</h1>
          <p className="subtitle">
            Memorize colours, then recreate them from memory.
          </p>

          <div className="form-group">
            <label htmlFor="playerName">Your Name</label>
            <input
              type="text"
              id="playerName"
              placeholder="Enter your name"
              maxLength={20}
              autoComplete="off"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && playerName.trim()) beginGame();
              }}
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <div className="mode-selector">
              <button
                type="button"
                className={`mode-btn ${mode === "regular" ? "active" : ""}`}
                onClick={() => setMode("regular")}
              >
                <span className="mode-name">Regular</span>
                <span className="mode-desc">6 seconds</span>
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === "hard" ? "active" : ""}`}
                onClick={() => setMode("hard")}
              >
                <span className="mode-name">Hard</span>
                <span className="mode-desc">3 seconds</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn"
            disabled={!playerName.trim()}
            onClick={beginGame}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------- Challenge --------------------------- */
  if (screen === "challenge" && challenge) {
    return (
      <div id="challenge" className="cmg">
        <div className="challenge-content animate-in">
          <div className="challenge-header">
            <p className="challenge-intro">Can you beat</p>
            <p className="challenge-name">{challenge.name}</p>
            <p className="challenge-score">{challenge.score}</p>
            <p className="challenge-max">out of {MAX_SCORE}</p>
          </div>

          <div className="form-group">
            <label htmlFor="challengeName">Your Name</label>
            <input
              type="text"
              id="challengeName"
              placeholder="Enter your name"
              maxLength={20}
              autoComplete="off"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && playerName.trim()) acceptChallenge();
              }}
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <div className="mode-selector">
              <button
                type="button"
                className={`mode-btn ${mode === "regular" ? "active" : ""}`}
                onClick={() => setMode("regular")}
              >
                <span className="mode-name">Regular</span>
                <span className="mode-desc">6 seconds</span>
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === "hard" ? "active" : ""}`}
                onClick={() => setMode("hard")}
              >
                <span className="mode-name">Hard</span>
                <span className="mode-desc">3 seconds</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn"
            disabled={!playerName.trim()}
            onClick={acceptChallenge}
          >
            Accept Challenge
          </button>
        </div>
      </div>
    );
  }

  /* ----------------------------- Final ------------------------------ */
  if (screen === "final") {
    return (
      <div id="results" className="cmg">
        <div className="final-card animate-in">
          <p className="final-title">Results</p>
          <p className="final-name">{playerName}</p>

          <p className="final-score-label">Total Score</p>
          <p className="final-score">{totalScore}</p>
          <p className="final-max">out of {MAX_SCORE}</p>

          <p className="final-accuracy">{avgAccuracy}% average accuracy</p>

          <button type="button" className="btn" onClick={playAgain}>
            Play Again
          </button>

          <div className="challenge-section">
            <p className="challenge-prompt">Think your friends can beat you?</p>
            <p className="challenge-subtext">
              Send them a challenge and find out
            </p>
            <div className="share-buttons">
              <button
                type="button"
                className="btn btn-primary"
                onClick={shareChallenge}
              >
                Challenge a Friend
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => copyToClipboard(challengeUrl)}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
        <div className={`copied-toast ${copied ? "show" : ""}`}>
          Link copied to clipboard
        </div>
      </div>
    );
  }

  /* ------------------------- Game (in-round) ------------------------ */
  return (
    <div id="game" className="cmg">
      <div className="game-header">
        <button type="button" className="quit-btn" onClick={quitGame}>
          Quit
        </button>
        <span className="round-indicator">
          {currentRound} of {TOTAL_ROUNDS}
        </span>
      </div>

      <div id="gameContent">
        {screen === "memorize" && (
          <div className="memorize-screen">
            <div
              className="color-fullscreen"
              style={{
                backgroundColor: targetColor,
                color: getTextColor(targetColor),
              }}
            >
              <p className="memorize-text">Memorize this colour</p>
              <p className="countdown-display">{countdown}</p>
            </div>
          </div>
        )}

        {screen === "guess" && (
          <div className="guess-screen">
            <div
              className="guess-color-preview"
              style={{ backgroundColor: guessColor }}
            />
            <div className="guess-controls">
              <div className="slider-group">
                <span className="slider-label">Hue</span>
                <Slider
                  value={hue}
                  min={0}
                  max={359}
                  onChange={setHue}
                  className="hue-track"
                />
              </div>
              <div className="slider-group">
                <span className="slider-label">Intensity</span>
                <Slider
                  value={intensity}
                  min={0}
                  max={100}
                  onChange={setIntensity}
                  style={{
                    background: `linear-gradient(to right, #1a1a1a, hsl(${hue}, 70%, 50%), #ffffff)`,
                  }}
                />
              </div>
              <button type="button" className="btn" onClick={submitGuess}>
                Submit
              </button>
            </div>
          </div>
        )}

        {screen === "result" && (
          <div id="result-screen">
            <div className="color-comparison">
              <div
                className="color-half"
                style={{
                  backgroundColor: targetColor,
                  color: getTextColor(targetColor),
                }}
              >
                <span className="color-label">Target</span>
                <span className="color-hex">{targetColor.toUpperCase()}</span>
              </div>
              <div
                className="color-half"
                style={{
                  backgroundColor: lastGuess,
                  color: getTextColor(lastGuess),
                }}
              >
                <span className="color-label">Yours</span>
                <span className="color-hex">{lastGuess.toUpperCase()}</span>
              </div>
            </div>
            <div className="result-bottom">
              <p className="result-rating">
                {getRating(calculateScore(targetColor, lastGuess).accuracy)}
              </p>
              <p className="result-accuracy">
                {calculateScore(targetColor, lastGuess).accuracy}%
              </p>
              <button type="button" className="btn" onClick={proceed}>
                Proceed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
