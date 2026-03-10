import { useCallback } from "react";

/**
 * Hook to trigger particle effects at the click location
 * Dispatches a custom event that the ParticleEffects component listens for
 *
 * @returns Memoized function to trigger particles at x, y coordinates
 */
export function useParticleEffect() {
  return useCallback((x: number, y: number) => {
    // Dispatch a custom event for ParticleEffects to listen to
    window.dispatchEvent(
      new CustomEvent("triggerParticles", {
        detail: { x, y },
      })
    );
  }, []);
}
