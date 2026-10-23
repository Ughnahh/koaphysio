/**
 * Placeholder for hero photography.
 *
 * Reproduces the reference layout (curved left edge, warm light) without
 * using any unlicensed imagery. Replace the scene with an optimised <Image>
 * inside the clipped container once licensed photography is supplied.
 */
export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="hero-arch" clipPathUnits="objectBoundingBox">
            <path d="M0.42,0 H1 V1 H0 C0.12,0.82 0.16,0.62 0.22,0.42 C0.27,0.22 0.33,0.06 0.42,0 Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="absolute inset-0" style={{ clipPath: "url(#hero-arch)" }}>
        <svg className="size-full" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="hero-wall" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ece7e0" />
              <stop offset="55%" stopColor="#ddd4c8" />
              <stop offset="100%" stopColor="#cfc3b4" />
            </linearGradient>
            <linearGradient id="hero-beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="160" height="100" fill="url(#hero-wall)" />
          {/* Window light falling across the wall */}
          <g transform="rotate(-28 80 50)" opacity="0.8">
            <rect x="50" y="-40" width="8" height="180" fill="url(#hero-beam)" />
            <rect x="66" y="-40" width="5" height="180" fill="url(#hero-beam)" />
            <rect x="80" y="-40" width="9" height="180" fill="url(#hero-beam)" />
          </g>
          {/* Floor */}
          <rect y="86" width="160" height="14" fill="#c6b9a8" opacity="0.55" />
          {/* Exercise ball and stool */}
          <circle cx="140" cy="78" r="10" fill="#efe9e2" opacity="0.95" />
          <rect x="118" y="70" width="12" height="2" rx="1" fill="#b59a7d" opacity="0.7" />
          <rect x="119.5" y="72" width="1.4" height="14" fill="#b59a7d" opacity="0.7" />
          <rect x="127" y="72" width="1.4" height="14" fill="#b59a7d" opacity="0.7" />
          {/* Plant */}
          <g stroke="#7d8a6e" strokeWidth="0.7" fill="none" opacity="0.65">
            <path d="M154 64 C151 50 153 38 156 28" />
            <path d="M154 56 l-4 -3 M154.5 49 l-4 -3 M155 42 l-3.5 -3 M154.4 59 l3 -3 M154.8 51 l3 -3 M155.4 44 l3 -3" />
          </g>
        </svg>
      </div>
      <span className="absolute bottom-4 right-4 rounded-full bg-white/60 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-ink-soft backdrop-blur">
        Photography placeholder
      </span>
    </div>
  );
}
