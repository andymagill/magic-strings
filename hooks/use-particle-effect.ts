/**
 * Hook to trigger particle effects at the click location
 * Dispatches a custom event that the ParticleEffects component listens for
 */
export function useParticleEffect() {
  const triggerParticles = (x: number, y: number) => {
    // Dispatch a custom event for ParticleEffects to listen to
    window.dispatchEvent(
      new CustomEvent("triggerParticles", {
        detail: { x, y },
      })
    );
  };

  return triggerParticles;
}
