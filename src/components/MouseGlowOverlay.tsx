import { useMouse } from "@/hooks/useMouse";

/**
 * Subtle radial gradient that follows mouse cursor.
 * Purely decorative, does not affect Spline or LLM state.
 */
export function MouseGlowOverlay() {
  const { x, y } = useMouse();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
      style={{
        background: `radial-gradient(600px at ${x}px ${y}px, hsl(var(--primary) / 0.15), transparent 80%)`,
      }}
      aria-hidden="true"
    />
  );
}
