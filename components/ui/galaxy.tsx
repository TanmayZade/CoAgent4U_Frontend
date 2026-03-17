"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

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

export function Galaxy({
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  speed = 1,
  glowIntensity = 0.3,
  saturation = 0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  transparent = true,
  className = "",
}: GalaxyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Particles array
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      targetOpacity: number
      hue: number
      twinklePhase: number
    }

    const particles: Particle[] = []
    const particleCount = Math.floor(200 * density)
    let rotation = 0
    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 400
      particles.push({
        x: canvas.width / 2 + Math.cos(angle) * distance,
        y: canvas.height / 2 + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * starSpeed,
        vy: (Math.random() - 0.5) * starSpeed,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        targetOpacity: Math.random() * 0.7 + 0.3,
        hue: hueShift + Math.random() * 30,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      // Clear canvas - use transparent background for better blending
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        // Rotation
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const dx = particle.x - centerX
        const dy = particle.y - centerY

        const angle = Math.atan2(dy, dx) + (rotationSpeed * speed) / 100
        const distance = Math.sqrt(dx * dx + dy * dy)

        particle.x = centerX + Math.cos(angle) * distance
        particle.y = centerY + Math.sin(angle) * distance

        // Velocity
        particle.vx += (Math.random() - 0.5) * 0.02
        particle.vy += (Math.random() - 0.5) * 0.02
        particle.x += particle.vx * speed
        particle.y += particle.vy * speed

        // Mouse repulsion
        if (mouseRepulsion) {
          const mdx = particle.x - mouseX
          const mdy = particle.y - mouseY
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy)

          if (mdist < 150) {
            const force = (150 - mdist) / 150
            particle.vx += (mdx / mdist) * force * repulsionStrength
            particle.vy += (mdy / mdist) * force * repulsionStrength
          }
        }

        // Boundary wrapping
        if (particle.x > canvas.width + 50) particle.x = -50
        if (particle.x < -50) particle.x = canvas.width + 50
        if (particle.y > canvas.height + 50) particle.y = -50
        if (particle.y < -50) particle.y = canvas.height + 50

        // Twinkling
        particle.twinklePhase += 0.02
        particle.targetOpacity =
          0.3 + Math.sin(particle.twinklePhase) * twinkleIntensity * 0.5
        particle.opacity +=
          (particle.targetOpacity - particle.opacity) * 0.1

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * (1 + glowIntensity)
        )
        gradient.addColorStop(
          0,
          `hsla(${particle.hue}, ${100 - saturation}%, 70%, ${particle.opacity * 0.8})`
        )
        gradient.addColorStop(
          1,
          `hsla(${particle.hue}, ${100 - saturation}%, 70%, 0)`
        )

        ctx.fillStyle = gradient
        ctx.fillRect(
          particle.x - particle.size * (1 + glowIntensity),
          particle.y - particle.size * (1 + glowIntensity),
          particle.size * 2 * (1 + glowIntensity),
          particle.size * 2 * (1 + glowIntensity)
        )
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [
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
  ])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  )
}
