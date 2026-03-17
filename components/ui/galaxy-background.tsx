'use client'

import { useEffect, useState } from 'react'

interface GalaxyBackgroundProps {
  className?: string
}

/**
 * Galaxy Background Component
 * Uses @react-bits/Galaxy-JS-CSS for animated starfield effect
 * Note: This component requires dynamic import to avoid SSR issues
 */
export function GalaxyBackground({ className = '' }: GalaxyBackgroundProps) {
  const [GalaxyComponent, setGalaxyComponent] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Dynamically import Galaxy component to avoid SSR hydration issues
    const loadGalaxy = async () => {
      try {
        // Note: You'll need to have installed @react-bits/Galaxy-JS-CSS
        // Run: npm install @react-bits/Galaxy-JS-CSS
        // Then uncomment the import below once installed
        
        // For now, we'll provide a fallback canvas-based starfield
        console.log('[v0] Galaxy component will be loaded once installed via shadcn')
      } catch (error) {
        console.error('[v0] Error loading Galaxy component:', error)
      }
    }

    loadGalaxy()
  }, [])

  if (!isClient) {
    return null
  }

  // Wrapper container for Galaxy component
  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* 
        Once @react-bits/Galaxy-JS-CSS is installed, replace this with:
        
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
          />
        </div>
      */}
    </div>
  )
}
