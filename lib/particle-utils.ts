/**
 * Particle system utilities for generating firework burst effects
 */

export interface Particle {
  id: string
  x: number
  y: number
  tx: number
  ty: number
  duration: number
  delay: number
  color: 'primary' | 'secondary' | 'tertiary'
}

/**
 * Generates a burst of firework particles radiating from a point
 * Creates a subtle, understated sparkle effect
 *
 * @param x - X coordinate of click location
 * @param y - Y coordinate of click location
 * @returns Array of particles with randomized trajectories
 *
 * @example
 * const particles = generateFireworkParticles(100, 200)
 * // Returns ~14 particles fanning out in all directions
 */
export function generateFireworkParticles(x: number, y: number): Particle[] {
  const particleCount = 6 + Math.floor(Math.random() * 3) // 6-8 particles
  const particles: Particle[] = []
  const colors: Array<'primary' | 'secondary' | 'tertiary'> = [
    'primary',
    'secondary',
    'tertiary',
  ]

  for (let i = 0; i < particleCount; i++) {
    // Distribute particles evenly around 360 degrees with slight randomization
    const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
    const velocity = 60 + Math.random() * 40 // 60-100px spread distance

    const tx = Math.cos(angle) * velocity
    const ty = Math.sin(angle) * velocity

    particles.push({
      id: `${Date.now()}-${i}`,
      x,
      y,
      tx,
      ty,
      duration: 500 + Math.random() * 150, // 500-650ms, varied for natural effect
      delay: Math.random() * 30, // up to 30ms stagger
      color: colors[i % colors.length],
    })
  }

  return particles
}
