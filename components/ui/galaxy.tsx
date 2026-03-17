'use client'

import { useEffect, useRef, useState } from 'react'

interface GalaxyProps {
  starSpeed?: number
  density?: number
  hueShift?: number
  speed?: number
  glowIntensity?: number
  saturation?: number
  mouseRepulsion?: boolean
  repulsionStrength?: number
  twinkleIntensity?: number
  rotationSpeed?: number
  transparent?: boolean
  className?: string
}

interface Star {
  x: number
  y: number
  z: number
  size: number
  opacity: number
  vx: number
  vy: number
  hue: number
  twinkle: number
  twinkleSpeed: number
}

export function Galaxy({
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  speed = 1,
  glowIntensity = 0.3,
  saturation = 0,
  mouseRepulsion = false,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  transparent = true,
  className = '',
}: GalaxyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Mouse move listener for repulsion effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    if (mouseRepulsion) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    // Initialize stars
    const starCount = Math.floor(200 * density)
    const stars: Star[] = []

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        vx: (Math.random() - 0.5) * starSpeed,
        vy: (Math.random() - 0.5) * starSpeed,
        hue: hueShift + Math.random() * 40 - 20,
        twinkle: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      })
    }

    starsRef.current = stars

    let rotation = 0

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = transparent ? 'rgba(0, 0, 0, 0)' : 'rgba(10, 10, 20, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      rotation += rotationSpeed * 0.1

      stars.forEach((star) => {
        // Apply mouse repulsion
        if (mouseRepulsion) {
          const dx = star.x - mouseRef.current.x
          const dy = star.y - mouseRef.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = 100

          if (distance < minDistance) {
            const angle = Math.atan2(dy, dx)
            const force = (minDistance - distance) / minDistance
            star.vx += Math.cos(angle) * force * repulsionStrength
            star.vy += Math.sin(angle) * force * repulsionStrength
          }
        }

        // Apply velocity
        star.x += star.vx * speed
        star.y += star.vy * speed

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0

        // Twinkling effect
        star.twinkle += star.twinkleSpeed
        const twinkleValue =
          Math.sin(star.twinkle) * twinkleIntensity +
          (1 - twinkleIntensity)

        // Draw star with glow
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.size * (2 + glowIntensity * 5)
        )

        gradient.addColorStop(
          0,
          `hsla(${star.hue}, ${100 - saturation}%, 70%, ${
            star.opacity * twinkleValue * 0.8
          })`
        )
        gradient.addColorStop(
          1,
          `hsla(${star.hue}, ${100 - saturation}%, 70%, 0)`
        )

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(
          star.x,
          star.y,
          star.size * (2 + glowIntensity * 5),
          0,
          Math.PI * 2
        )
        ctx.fill()

        // Core star
        ctx.fillStyle = `hsla(${star.hue}, ${100 - saturation}%, 80%, ${
          star.opacity * twinkleValue
        })`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (mouseRepulsion) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    mounted,
    starSpeed,
    density,
    hueShift,
    speed,
    glowIntensity,
    saturation,
    mouseRepulsion,
    repulsionStrength,
    twinkleIntensity,
    rotationSpeed,
    transparent,
  ])

  if (!mounted) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 ${className}`}
      style={{ pointerEvents: 'none', zIndex: -30 }}
    />
  )
}
