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
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    startTimeRef.current = performance.now()

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    setSize()

    const ro = new ResizeObserver(() => {
      setSize()
    })
    ro.observe(canvas)

    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, w, h)

      // --- Draw grid lines ---
      const gridSize = Math.max(w, h) * gridScale
      ctx.save()
      ctx.strokeStyle = linesColor
      ctx.lineWidth = lineThickness
      ctx.globalAlpha = 1

      if (lineStyle === 'dashed') {
        ctx.setLineDash([gridSize * 0.3, gridSize * 0.2])
      } else {
        ctx.setLineDash([])
      }

      // Vertical lines
      for (let x = 0; x <= w + gridSize; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y <= h + gridSize; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      ctx.restore()

      // --- Draw scan line ---
      if (elapsed >= scanDelay) {
        const t = elapsed - scanDelay
        let scanPos = 0

        if (scanDirection === 'vertical') {
          scanPos = ((t / scanDuration) % 1) * h
        } else if (scanDirection === 'horizontal') {
          scanPos = ((t / scanDuration) % 1) * w
        } else {
          // pingpong
          const cycle = (t / scanDuration) % 2
          scanPos = cycle < 1 ? cycle * h : (2 - cycle) * h
        }

        const softPx = scanSoftness * 20
        const isHorizontal = scanDirection === 'horizontal'

        ctx.save()

        // Outer glow
        if (scanGlow > 0) {
          const glowGrad = isHorizontal
            ? ctx.createLinearGradient(scanPos - softPx * 1.5, 0, scanPos + softPx * 1.5, 0)
            : ctx.createLinearGradient(0, scanPos - softPx * 1.5, 0, scanPos + softPx * 1.5)
          glowGrad.addColorStop(0, `${scanColor}00`)
          glowGrad.addColorStop(0.5, `${scanColor}${Math.round(scanOpacity * scanGlow * 0.5 * 255).toString(16).padStart(2, '0')}`)
          glowGrad.addColorStop(1, `${scanColor}00`)
          ctx.fillStyle = glowGrad
          if (isHorizontal) {
            ctx.fillRect(scanPos - softPx * 1.5, 0, softPx * 3, h)
          } else {
            ctx.fillRect(0, scanPos - softPx * 1.5, w, softPx * 3)
          }
        }

        // Core scan line gradient
        const grad = isHorizontal
          ? ctx.createLinearGradient(scanPos - softPx, 0, scanPos + softPx, 0)
          : ctx.createLinearGradient(0, scanPos - softPx, 0, scanPos + softPx)

        grad.addColorStop(0, `${scanColor}00`)
        grad.addColorStop(0.5, `${scanColor}${Math.round(scanOpacity * 255).toString(16).padStart(2, '0')}`)
        grad.addColorStop(1, `${scanColor}00`)

        ctx.fillStyle = grad
        if (isHorizontal) {
          ctx.fillRect(scanPos - softPx, 0, softPx * 2, h)
        } else {
          ctx.fillRect(0, scanPos - softPx, w, softPx * 2)
        }

        ctx.restore()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    const handleClick = () => {
      if (scanOnClick) startTimeRef.current = performance.now()
    }
    canvas.addEventListener('click', handleClick)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      ro.disconnect()
      canvas.removeEventListener('click', handleClick)
    }
  }, [lineThickness, linesColor, scanColor, scanOpacity, gridScale, lineStyle, scanDirection, scanGlow, scanSoftness, scanDuration, scanDelay, scanOnClick])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
