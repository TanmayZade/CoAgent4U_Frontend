'use client'

import { useEffect, useRef, useState } from 'react'

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
}: GridScanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(0)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Handle resize and set dimensions on client only
  useEffect(() => {
    startTimeRef.current = Date.now()
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = dimensions
    const dpr = window.devicePixelRatio || 1
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
  }, [dimensions, gridScale, lineThickness, linesColor, scanColor, scanOpacity, lineStyle, lineJitter, scanDirection, noiseIntensity, scanGlow, scanSoftness, scanDuration, scanDelay, scanOnClick])

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: dimensions.width, 
            height: dimensions.height, 
            display: 'block' 
          }} 
        />
      )}
    </div>
  )
}
