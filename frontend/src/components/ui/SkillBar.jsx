import React from "react";

/**
 * Animated skill progress bar with label and percentage.
 * @param {string} label - Skill name
 * @param {number} value - 0 to 100
 * @param {string} color - Bar color
 */
export default function SkillBar({ label = "Skill", value = 0, color = "#6366f1" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>
          {value}%
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 99,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, Math.max(0, value))}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            transition: "width 1s ease-out",
          }}
        />
      </div>
    </div>
  );
}
