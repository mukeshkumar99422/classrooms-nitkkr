"use client";

export default function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "hsl(222, 22%, 14%)" }}
    >
      {/* SVG dot-grid pattern overlay */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="hsl(217, 60%, 65%)" fillOpacity="0.13" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Soft radial glow in center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(217,70%,30%,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Corner accent glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full"
        style={{
          background: "hsl(217, 80%, 50%)",
          opacity: 0.06,
          filter: "blur(80px)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
        style={{
          background: "hsl(240, 70%, 55%)",
          opacity: 0.06,
          filter: "blur(80px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}