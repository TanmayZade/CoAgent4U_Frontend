"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  Bell, 
  MessageSquare,
  Zap,
  Bot,
  Sparkles,
  Target,
  Layers,
  Shield
} from "lucide-react"

interface FloatingIcon {
  id: number
  Icon: React.ElementType
  x: number
  y: number
  size: number
  delay: number
  duration: number
  rotationRange: number
}

const iconComponents = [
  Calendar, Clock, Users, CheckCircle, Bell, MessageSquare,
  Zap, Bot, Sparkles, Target, Layers, Shield
]

// Seeded random number generator — same sequence every run
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function generateIcons(count: number): FloatingIcon[] {
  const rand = seededRandom(42)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    Icon: iconComponents[i % iconComponents.length],
    x: rand() * 100,
    y: rand() * 100,
    size: 24 + rand() * 24,
    delay: rand() * 2,
    duration: 15 + rand() * 10,
    rotationRange: 10 + rand() * 20,
  }))
}

// Pre-generated at module level so value is identical on every call (server + client)
const ICONS = generateIcons(18)

function FloatingIconItem({
  icon,
  mouseXPx,
  mouseYPx,
}: {
  icon: FloatingIcon
  mouseXPx: number
  mouseYPx: number
}) {
  const parallaxMultiplier = 0.3 + (icon.y / 100) * 0.7
  const tx = mouseXPx * parallaxMultiplier
  const ty = mouseYPx * parallaxMultiplier

  return (
    // Outer div: absolute position (non-static) — required parent for any Framer internal checks
    <div
      className="absolute pointer-events-none"
      style={{ left: `${icon.x}%`, top: `${icon.y}%` }}
    >
      {/*
        Apply parallax via inline style `transform` (plain CSS, no motion values).
        This avoids Framer Motion's useTransform / useSpring path that calls
        getScrollOffsets() and requires a positioned ancestor.
        The float / scale / rotate loop uses `animate` keyframes only.
      */}
      <motion.div
        style={{
          transform: `translate(${tx}px, ${ty}px)`,
          transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scale: [1, 1.1, 1],
          rotate: [-icon.rotationRange / 2, icon.rotationRange / 2, -icon.rotationRange / 2],
        }}
        initial={{ opacity: 0, scale: 0 }}
        transition={{
          opacity: { duration: icon.duration, delay: icon.delay, repeat: Infinity, ease: "easeInOut" },
          scale:   { duration: icon.duration, delay: icon.delay, repeat: Infinity, ease: "easeInOut" },
          rotate:  { duration: icon.duration, delay: icon.delay, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <icon.Icon
          style={{ width: icon.size, height: icon.size }}
          className="text-foreground/20 dark:text-foreground/15"
          strokeWidth={1.5}
        />
      </motion.div>
    </div>
  )
}

export function FloatingIcons({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Store mouse offset in pixels relative to container center
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  // Defer rendering until after hydration
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // Normalize to [-1, 1] from center
      setMouse({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 30,
      })
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      {mounted && ICONS.map((icon) => (
        <FloatingIconItem
          key={icon.id}
          icon={icon}
          mouseXPx={mouse.x}
          mouseYPx={mouse.y}
        />
      ))}
    </div>
  )
}

// Morphing icon component for special effects
export function MorphingIcon({ className = "" }: { className?: string }) {
  const iconVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 2, ease: "easeInOut" }
    },
  }
  
  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          className="text-foreground/10"
          variants={iconVariants}
          initial="initial"
          animate="animate"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          className="text-foreground/15"
          variants={iconVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3, duration: 2, ease: "easeInOut" }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="20"
          className="text-foreground/20"
          variants={iconVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6, duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  )
}

// Orbiting icons around a central element
export function OrbitingIcons({ className = "" }: { className?: string }) {
  const orbitIcons = [Calendar, Users, Clock, CheckCircle, Bot, Zap]
  
  return (
    <div className={`relative ${className}`}>
      {orbitIcons.map((Icon, index) => {
        const angle = (index / orbitIcons.length) * 360
        const delay = index * 0.2
        
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: 20 + index * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              style={{
                x: 120 + index * 15,
                y: 0,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 3,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon 
                className="w-6 h-6 text-foreground/30 dark:text-foreground/20"
                strokeWidth={1.5}
              />
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
