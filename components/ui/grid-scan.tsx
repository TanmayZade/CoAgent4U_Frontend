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
  className?: string
}

export function GridScan({
  lineThickness = 1,
  linesColor = '#392e4e',
  scanColor = '#ffffff',
  scanOpacity = 0.4,
  gridScale = 0.1,
  lineStyle = 'solid',
  scanDirection = 'pingpong',
  scanGlow = 0.5,
  scanSoftness = 2,
  scanDuration = 2,
  scanDelay = 2,
  scanOnClick = false,
  className,
}: GridScanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    startTimeRef.current = performance.now()

    const setSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    setSize()

    const ro = new ResizeObserver(() => {
      setSize()
    })
    ro.observe(canvas)

    // Draw a 3D perspective grid tunnel
    const drawPerspectiveGrid = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      time: number
    ) => {
      const cx = w / 2
      const cy = h / 2

      // Grid configuration
      const gridLines = Math.floor(12 / gridScale)
      const depth = 20 // Number of depth layers

      ctx.strokeStyle = linesColor
      ctx.lineWidth = lineThickness

      if (lineStyle === 'dashed') {
        ctx.setLineDash([8, 4])
      } else {
        ctx.setLineDash([])
      }

      // Draw floor grid (bottom half - perspective grid going into distance)
      for (let z = 1; z <= depth; z++) {
        const perspective = z / depth
        const y = cy + (h / 2) * perspective * 0.9

        // Horizontal lines (receding into distance)
        ctx.beginPath()
        const leftX = cx - (w / 2) * perspective * 1.5
        const rightX = cx + (w / 2) * perspective * 1.5
        ctx.moveTo(leftX, y)
        ctx.lineTo(rightX, y)
        ctx.globalAlpha = 0.3 + perspective * 0.5
        ctx.stroke()
      }

      // Draw vertical lines on floor (converging to center)
      for (let i = -gridLines; i <= gridLines; i++) {
        const xOffset = (i / gridLines) * (w / 2) * 1.5
        ctx.beginPath()
        ctx.moveTo(cx + xOffset * 0.05, cy) // Vanishing point
        ctx.lineTo(cx + xOffset, h)
        ctx.globalAlpha = 0.4
        ctx.stroke()
      }

      // Draw ceiling grid (top half - perspective grid going into distance)
      for (let z = 1; z <= depth; z++) {
        const perspective = z / depth
        const y = cy - (h / 2) * perspective * 0.9

        // Horizontal lines (receding into distance)
        ctx.beginPath()
        const leftX = cx - (w / 2) * perspective * 1.5
        const rightX = cx + (w / 2) * perspective * 1.5
        ctx.moveTo(leftX, y)
        ctx.lineTo(rightX, y)
        ctx.globalAlpha = 0.3 + perspective * 0.5
        ctx.stroke()
      }

      // Draw vertical lines on ceiling (converging to center)
      for (let i = -gridLines; i <= gridLines; i++) {
        const xOffset = (i / gridLines) * (w / 2) * 1.5
        ctx.beginPath()
        ctx.moveTo(cx + xOffset * 0.05, cy) // Vanishing point
        ctx.lineTo(cx + xOffset, 0)
        ctx.globalAlpha = 0.4
        ctx.stroke()
      }

      // Draw left wall grid
      for (let z = 1; z <= depth; z++) {
        const perspective = z / depth
        const x = cx - (w / 2) * perspective * 0.9

        // Vertical lines on left wall
        ctx.beginPath()
        const topY = cy - (h / 2) * perspective * 0.9
        const bottomY = cy + (h / 2) * perspective * 0.9
        ctx.moveTo(x, topY)
        ctx.lineTo(x, bottomY)
        ctx.globalAlpha = 0.3 + perspective * 0.4
        ctx.stroke()
      }

      // Draw horizontal lines on left wall
      for (let i = -gridLines / 2; i <= gridLines / 2; i++) {
        const yOffset = (i / (gridLines / 2)) * (h / 2)
        ctx.beginPath()
        ctx.moveTo(cx, cy + yOffset * 0.05) // Vanishing point
        ctx.lineTo(0, cy + yOffset)
        ctx.globalAlpha = 0.4
        ctx.stroke()
      }

      // Draw right wall grid
      for (let z = 1; z <= depth; z++) {
        const perspective = z / depth
        const x = cx + (w / 2) * perspective * 0.9

        // Vertical lines on right wall
        ctx.beginPath()
        const topY = cy - (h / 2) * perspective * 0.9
        const bottomY = cy + (h / 2) * perspective * 0.9
        ctx.moveTo(x, topY)
        ctx.lineTo(x, bottomY)
        ctx.globalAlpha = 0.3 + perspective * 0.4
        ctx.stroke()
      }

      // Draw horizontal lines on right wall
      for (let i = -gridLines / 2; i <= gridLines / 2; i++) {
        const yOffset = (i / (gridLines / 2)) * (h / 2)
        ctx.beginPath()
        ctx.moveTo(cx, cy + yOffset * 0.05) // Vanishing point
        ctx.lineTo(w, cy + yOffset)
        ctx.globalAlpha = 0.4
        ctx.stroke()
      }

      ctx.globalAlpha = 1
    }

    // Draw scan effect
    const drawScanEffect = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      scanPos: number,
      isVertical: boolean
    ) => {
      const softPx = scanSoftness * 25
      const cx = w / 2
      const cy = h / 2

      ctx.save()

      if (isVertical) {
        // Vertical scan - affects the depth perception
        const scanY = scanPos

        // Create glow effect
        if (scanGlow > 0) {
          const glowGrad = ctx.createLinearGradient(0, scanY - softPx * 2, 0, scanY + softPx * 2)
          glowGrad.addColorStop(0, `${scanColor}00`)
          glowGrad.addColorStop(0.5, `${scanColor}${Math.round(scanOpacity * scanGlow * 255).toString(16).padStart(2, '0')}`)
          glowGrad.addColorStop(1, `${scanColor}00`)
          ctx.fillStyle = glowGrad
          ctx.fillRect(0, scanY - softPx * 2, w, softPx * 4)
        }

        // Core scan line
        const grad = ctx.createLinearGradient(0, scanY - softPx, 0, scanY + softPx)
        grad.addColorStop(0, `${scanColor}00`)
        grad.addColorStop(0.5, `${scanColor}${Math.round(scanOpacity * 255).toString(16).padStart(2, '0')}`)
        grad.addColorStop(1, `${scanColor}00`)
        ctx.fillStyle = grad
        ctx.fillRect(0, scanY - softPx, w, softPx * 2)

        // Illuminate grid lines near scan
        const perspective = Math.abs(scanY - cy) / (h / 2)
        if (perspective < 1) {
          ctx.strokeStyle = scanColor
          ctx.lineWidth = lineThickness + 1
          ctx.globalAlpha = scanOpacity * (1 - perspective * 0.5)
          
          // Draw highlighted horizontal line at scan position
          const leftX = cx - (w / 2) * Math.max(0.1, perspective) * 1.5
          const rightX = cx + (w / 2) * Math.max(0.1, perspective) * 1.5
          ctx.beginPath()
          ctx.moveTo(leftX, scanY)
          ctx.lineTo(rightX, scanY)
          ctx.stroke()
        }
      }

      ctx.restore()
    }

    const animate = (now: number) => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      console.log("[v0] GridScan animate - w:", w, "h:", h, "canvas.width:", canvas.width, "canvas.height:", canvas.height)

      if (w === 0 || h === 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const elapsed = (now - startTimeRef.current) / 1000

      ctx.clearRect(0, 0, w, h)

      // Draw a test rectangle to verify canvas is working
      ctx.fillStyle = 'red'
      ctx.fillRect(10, 10, 100, 100)
      console.log("[v0] Drew test rectangle")

      // Draw the 3D perspective grid
      drawPerspectiveGrid(ctx, w, h, elapsed)

      // Draw scan effect after delay
      if (elapsed >= scanDelay) {
        const t = elapsed - scanDelay
        let scanPos = 0

        if (scanDirection === 'vertical' || scanDirection === 'pingpong') {
          const cycle = (t / scanDuration) % 2
          scanPos = cycle < 1 ? cycle * h : (2 - cycle) * h
        } else {
          scanPos = ((t / scanDuration) % 1) * w
        }

        drawScanEffect(ctx, w, h, scanPos, scanDirection !== 'horizontal')
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    const handleClick = () => {
      if (scanOnClick) {
        startTimeRef.current = performance.now()
      }
    }

    canvas.addEventListener('click', handleClick)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      ro.disconnect()
      canvas.removeEventListener('click', handleClick)
    }
  }, [mounted, lineThickness, linesColor, scanColor, scanOpacity, gridScale, lineStyle, scanDirection, scanGlow, scanSoftness, scanDuration, scanDelay, scanOnClick])

  // Render nothing on server, canvas on client
  if (!mounted) {
    return <div className={className} />
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
