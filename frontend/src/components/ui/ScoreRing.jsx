import React from "react";

/**
 * SVG circular progress ring for displaying scores.
 * @param {number} score - 0 to 100
 * @param {number} size - diameter in px (default 120)
 * @param {number} strokeWidth - ring thickness (default 10)
 * @param {string} label - text label below score
 * @param {string} color - stroke color override
 */
export default function ScoreRing({ score = 0, size = 120, strokeWidth = 10, label = "", color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div style={{ position: "relative", marginTop: -size / 2 - 14, textAlign: "center" }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 700, color: getColor() }}>{score}</span>
      </div>
      <div style={{ marginTop: size * 0.18 }}>
        {label && (
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
