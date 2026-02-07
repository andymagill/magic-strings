"use client"

export function SpotlightBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Main sweeping spotlight */}
      <div
        className="absolute top-1/4 left-1/2 w-[800px] h-[800px] rounded-full animate-spotlight-sweep"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)",
        }}
      />
      {/* Secondary pulsing spotlight */}
      <div
        className="absolute top-[60%] left-[30%] w-[500px] h-[500px] rounded-full animate-spotlight-pulse"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 60%)",
        }}
      />
      {/* Top stage curtain gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,8,15,1) 0%, transparent 100%)",
        }}
      />
      {/* Bottom stage gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{
          background:
            "linear-gradient(to top, rgba(8,8,15,1) 0%, transparent 100%)",
        }}
      />
      {/* Subtle sparkle dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-foreground/30 animate-float-sparkle"
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}
