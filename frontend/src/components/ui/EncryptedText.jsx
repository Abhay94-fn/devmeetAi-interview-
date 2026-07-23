// frontend/src/components/ui/EncryptedText.jsx
import React, { useState, useEffect } from "react";

const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;':\",./<>?";

export function EncryptedText({
  text,
  encryptedClassName = "text-neutral-500",
  revealedClassName = "text-white",
  revealDelayMs = 40,
}) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [scramble, setScramble] = useState("");

  // Reset when text changes
  useEffect(() => {
    setRevealedCount(0);
  }, [text]);

  // Step-by-step character reveal
  useEffect(() => {
    if (!text) return;
    if (revealedCount >= text.length) return;

    const timer = setTimeout(() => {
      setRevealedCount((prev) => prev + 1);
    }, revealDelayMs);

    return () => clearTimeout(timer);
  }, [text, revealedCount, revealDelayMs]);

  // Fast scrambling for unrevealed characters
  useEffect(() => {
    if (!text) return;
    if (revealedCount >= text.length) {
      setScramble("");
      return;
    }

    const interval = setInterval(() => {
      const unrevealedLength = text.length - revealedCount;
      let scrambleStr = "";
      for (let i = 0; i < unrevealedLength; i++) {
        const originalChar = text[revealedCount + i];
        if (originalChar === " ") {
          scrambleStr += " ";
        } else {
          scrambleStr += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setScramble(scrambleStr);
    }, 45);

    return () => clearInterval(interval);
  }, [text, revealedCount]);

  if (!text) return null;

  return (
    <span className="font-mono">
      {text.split("").map((char, index) => {
        const isRevealed = index < revealedCount;
        let displayChar = char;
        
        if (!isRevealed) {
          const scrambleIndex = index - revealedCount;
          displayChar = scramble[scrambleIndex] || CHARS[Math.floor(Math.random() * CHARS.length)];
        }

        return (
          <span
            key={index}
            className={isRevealed ? revealedClassName : encryptedClassName}
          >
            {displayChar}
          </span>
        );
      })}
    </span>
  );
}
