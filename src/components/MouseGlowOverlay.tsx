import { useLocation } from "react-router-dom";
import { useMouse } from "@/hooks/useMouse";

// Same routes as SplineBackground
const GLOW_ENABLED_ROUTES = [
  "/auth",
  "/dashboard",
  "/profile-setup",
  "/verification",
  "/income-verification",
  "/subscription",
  "/subscribe",
  "/roommate-swipe",
  "/roommates/swipe",
  "/groups",
  "/messages",
];

/**
 * Subtle radial gradient that follows mouse cursor.
 * Only shows on pages with Spline background.
 */
export function MouseGlowOverlay() {
  const { x, y } = useMouse();
  const location = useLocation();
  
  const shouldShow = GLOW_ENABLED_ROUTES.some(
    route => location.pathname === route || location.pathname.startsWith(route + "/")
  );
  
  if (!shouldShow) return null;

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
