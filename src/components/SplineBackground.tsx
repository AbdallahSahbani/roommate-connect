import { useLocation } from "react-router-dom";

// Pages where Spline particle background should be visible
const SPLINE_ENABLED_ROUTES = [
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
 * SplineBackground - Decorative animated particle background
 * 
 * Mount ONCE at layout level. Only renders on specific pages.
 * Never tied to LLM state or user input.
 * Pointer events disabled to prevent form/scroll interference.
 */
export default function SplineBackground() {
  const location = useLocation();
  
  // Check if current route should show Spline
  const shouldShow = SPLINE_ENABLED_ROUTES.some(
    route => location.pathname === route || location.pathname.startsWith(route + "/")
  );
  
  if (!shouldShow) return null;
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <iframe
        src="https://my.spline.design/particlesforwebsite-O7wvRpDGjTPGSNAOZLSAKZeC/"
        className="w-full h-full pointer-events-none"
        frameBorder="0"
        aria-hidden="true"
        title="Decorative particle animation"
      />
    </div>
  );
}
