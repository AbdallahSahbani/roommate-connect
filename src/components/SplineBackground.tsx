/**
 * SplineBackground - Decorative animated particle background
 * 
 * Mount ONCE at layout level. Never tied to LLM state or user input.
 * Pointer events disabled to prevent form/scroll interference.
 */
export default function SplineBackground() {
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
