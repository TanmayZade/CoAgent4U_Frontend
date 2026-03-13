'use client'

import { useEffect, useRef } from 'react'

interface GridScanProps {
  sensitivity?: number
  lineThickness?: number
  linesColor?: string
  scanColor?: string
  scanOpacity?: number
  gridScale?: number
  lineStyle?: 'solid' | 'dashed'
  lineJitter?: number
  scanDirection?: 'horizontal' | 'vertical' | 'pingpong'
  noiseIntensity?: number
  scanGlow?: number
  scanSoftness?: number
  scanDuration?: number
  scanDelay?: number
  scanOnClick?: boolean
  width?: number
  height?: number
}

export function GridScan({
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = '#392e4e',
  scanColor = '#ffffff',
  scanOpacity = 0.4,
  gridScale = 0.1,
  lineStyle = 'solid',
  lineJitter = 0.1,
  scanDirection = 'pingpong',
  noiseIntensity = 0.01,
  scanGlow = 0.5,
  scanSoftness = 2,
  scanDuration = 2,
  scanDelay = 2,
  scanOnClick = false,
  width = 1080,
  height = 1080,
}: GridScanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(Date.now())
  const isHoveredRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const animate = () => {
      const now = Date.now()
      const elapsed = (now - startTimeRef.current) / 1000

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0)'
      ctx.clearRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = linesColor
      ctx.lineWidth = lineThickness
      ctx.globalAlpha = 0.5

      const gridSize = width * gridScale
      for (let x = 0; x <= width; x += gridSize) {
        const jitterX = Math.random() * lineJitter * gridSize
        ctx.beginPath()
        ctx.moveTo(x + jitterX, 0)
        ctx.lineTo(x + jitterX, height)
        ctx.stroke()
      }

      for (let y = 0; y <= height; y += gridSize) {
        const jitterY = Math.random() * lineJitter * gridSize
        ctx.beginPath()
        ctx.moveTo(0, y + jitterY)
        ctx.lineTo(width, y + jitterY)
        ctx.stroke()
      }

      // Calculate scan position
      let scanPos = 0
      if (scanDirection === 'horizontal') {
        scanPos = ((elapsed - scanDelay) / scanDuration) * width
      } else if (scanDirection === 'vertical') {
        scanPos = ((elapsed - scanDelay) / scanDuration) * height
      } else if (scanDirection === 'pingpong') {
        const cycle = ((elapsed - scanDelay) / scanDuration) % 2
        scanPos = cycle < 1 ? cycle * height : (2 - cycle) * height
      }

      // Draw scan line with glow
      if (elapsed >= scanDelay) {
        ctx.globalAlpha = scanOpacity
        ctx.fillStyle = scanColor

        // Glow effect
        const gradient = ctx.createLinearGradient(0, scanPos - scanSoftness * 20, 0, scanPos + scanSoftness * 20)
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`)
        gradient.addColorStop(0.5, scanColor)
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(0, scanPos - scanSoftness * 10, width, scanSoftness * 20)
      }

      ctx.globalAlpha = 1

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    if (scanOnClick) {
      const handleClick = () => {
        startTimeRef.current = Date.now()
      }
      canvas.addEventListener('click', handleClick)
      return () => canvas.removeEventListener('click', handleClick)
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [width, height, gridScale, lineThickness, linesColor, scanColor, scanOpacity, lineStyle, lineJitter, scanDirection, noiseIntensity, scanGlow, scanSoftness, scanDuration, scanDelay, scanOnClick])

  return <canvas ref={canvasRef} style={{ width, height, display: 'block' }} />
}
