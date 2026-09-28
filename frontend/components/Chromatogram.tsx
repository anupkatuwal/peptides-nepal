/** Decorative HPLC trace: flat baseline, a few small impurity peaks and one dominant main peak. */
export default function Chromatogram({ className }: { className?: string }) {
  const path =
    "M0 150 L60 150 C66 150 68 142 72 142 C76 142 78 150 84 150 L150 150 C156 150 158 128 164 104 C170 70 172 14 180 14 C188 14 190 70 196 104 C202 128 204 150 210 150 L262 150 C266 150 268 144 271 144 C274 144 276 150 280 150 L360 150";
  return (
    <svg viewBox="0 0 360 170" className={className} aria-hidden="true">
      {[30, 70, 110, 150].map((y) => (
        <line key={y} x1="0" x2="360" y1={y} y2={y} stroke="#E3E9EE" strokeDasharray="3 5" />
      ))}
      <path d={`${path} L360 170 L0 170 Z`} fill="url(#chromaFill)" />
      <path
        d={path}
        fill="none"
        stroke="#3F9068"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeDasharray="1200"
        className="motion-safe:animate-trace"
      />
      <line x1="180" x2="180" y1="14" y2="0" stroke="#13223D" strokeWidth="1" />
      <defs>
        <linearGradient id="chromaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5FAB83" stopOpacity="0.28" />
          <stop offset="1" stopColor="#5FAB83" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
