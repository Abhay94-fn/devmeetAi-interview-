/**
 * AriaWaveform — 5-bar animated waveform shown when Aria is speaking.
 * Each bar animates independently at different speeds using CSS keyframes
 * defined inline as a <style> tag (no extra CSS file needed).
 */
export default function AriaWaveform({ className = "" }) {
  const bars = [
    { delay: "0s",     duration: "0.4s" },
    { delay: "0.1s",   duration: "0.6s" },
    { delay: "0.05s",  duration: "0.5s" },
    { delay: "0.15s",  duration: "0.7s" },
    { delay: "0.08s",  duration: "0.45s" },
  ];

  return (
    <>
      <style>{`
        @keyframes ariaBar {
          0%, 100% { height: 4px; }
          50%       { height: 28px; }
        }
      `}</style>

      <div
        className={`flex items-end justify-center gap-[3px] h-8 ${className}`}
        aria-label="Aria is speaking"
        role="img"
      >
        {bars.map((bar, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: 3,
              background: "linear-gradient(to top, #06B6D4, #8B5CF6)",
              animation: `ariaBar ${bar.duration} ${bar.delay} ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
