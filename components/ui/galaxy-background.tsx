'use client'

import { Galaxy } from './galaxy'

interface GalaxyBackgroundProps {
  className?: string
}

/**
 * Galaxy Background Component Wrapper
 * Uses a canvas-based implementation of the Galaxy starfield effect
 */
export function GalaxyBackground({ className = '' }: GalaxyBackgroundProps) {
  return (
    <Galaxy
      starSpeed={0.5}
      density={1}
      hueShift={140}
      speed={1}
      glowIntensity={0.3}
      saturation={0}
      mouseRepulsion
      repulsionStrength={2}
      twinkleIntensity={0.3}
      rotationSpeed={0.1}
      transparent
      className={className}
    />
  )
}
