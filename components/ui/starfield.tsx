'use client'

import { useEffect, useRef } from 'react'

interface StarFieldProps {
  className?: string
}

export function StarField({ className }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create stars
    const stars: Array<{
      x: number
      y: number
      radius: number
      opacity: number
      twinkleSpeed: number
      targetOpacity: number
    }> = []

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        targetOpacity: Math.random() * 0.5 + 0.5,
      })
    }

    let animationId: number

    const animate = () => {
      // Clear canvas with slight transparency for trail effect
      ctx.fillStyle = 'rgba(15, 15, 15, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and update stars
      stars.forEach((star) => {
        // Twinkling effect
        if (Math.random() < 0.02) {
          star.targetOpacity = Math.random() * 0.5 + 0.5
        }
        star.opacity += (star.targetOpacity - star.opacity) * 0.1

        // Draw star with glow
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius + 10
        )

        gradient.addColorStop(0, `rgba(139, 92, 246, ${star.opacity * 0.8})`)
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${star.opacity * 0.4})`)
        gradient.addColorStop(1, `rgba(139, 92, 246, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(
          star.x - star.radius - 10,
          star.y - star.radius - 10,
          (star.radius + 10) * 2,
          (star.radius + 10) * 2
        )

        // Draw core
        ctx.fillStyle = `rgba(200, 150, 255, ${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'block',
      }}
    />
  )
}
