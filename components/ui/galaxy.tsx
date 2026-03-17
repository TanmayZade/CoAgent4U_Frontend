"use client"

import { useEffect, useRef } from "react"

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    console.log("[v0] Galaxy canvas initialized:", canvas.width, canvas.height)

    // Get parent dimensions
    const parent = canvas.parentElement
    if (!parent) return

    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    console.log("[v0] Canvas sized to parent:", canvas.width, canvas.height)

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
    const particleCount = Math.max(50, Math.floor(150 * density))
    let rotation = 0
    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * starSpeed,
        vy: (Math.random() - 0.5) * starSpeed,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        targetOpacity: Math.random() * 0.8 + 0.2,
        hue: hueShift + Math.random() * 40 - 20,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    console.log("[v0] Created", particleCount, "particles")

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    window.addEventListener("mousemove", handleMouseMove)

    let animationId: number

    const animate = () => {
      // Clear with slight trail
      ctx.fillStyle = "rgba(10, 10, 10, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx * speed
        particle.y += particle.vy * speed

        // Add slight acceleration
        particle.vx += (Math.random() - 0.5) * 0.01
        particle.vy += (Math.random() - 0.5) * 0.01

        // Mouse repulsion
        if (mouseRepulsion) {
          const dx = particle.x - mouseX
          const dy = particle.y - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 200) {
            const force = (200 - dist) / 200
            particle.vx += (dx / (dist || 1)) * force * repulsionStrength * 0.5
            particle.vy += (dy / (dist || 1)) * force * repulsionStrength * 0.5
          }
        }

        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0
        if (particle.x < 0) particle.x = canvas.width
        if (particle.y > canvas.height) particle.y = 0
        if (particle.y < 0) particle.y = canvas.height

        // Twinkling effect
        particle.twinklePhase += 0.05 * twinkleIntensity
        particle.targetOpacity =
          0.3 + Math.sin(particle.twinklePhase) * 0.4 * twinkleIntensity
        particle.opacity +=
          (particle.targetOpacity - particle.opacity) * 0.1

        // Draw particle with glow
        const glowSize = particle.size * (1 + glowIntensity * 2)

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowSize
        )
        glowGradient.addColorStop(
          0,
          `hsla(${particle.hue}, ${Math.max(0, 100 - saturation)}%, 70%, ${particle.opacity * 0.6})`
        )
        glowGradient.addColorStop(
          0.5,
          `hsla(${particle.hue}, ${Math.max(0, 100 - saturation)}%, 60%, ${particle.opacity * 0.2})`
        )
        glowGradient.addColorStop(
          1,
          `hsla(${particle.hue}, ${Math.max(0, 100 - saturation)}%, 50%, 0)`
        )

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 80%, ${particle.opacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.6, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("mousemove", handleMouseMove)
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
        display: "block",
      }}
    />
  )
}
