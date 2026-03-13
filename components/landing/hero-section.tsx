"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import gsap from "gsap"
import { TextPlugin } from "gsap/TextPlugin"

// Register GSAP TextPlugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin)
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const subheadlineRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user has seen intro animation
    const introSeen = localStorage.getItem("introSeen") === "true"

    if (introSeen) {
      // Skip animation and show content directly
      if (headlineRef.current) {
        headlineRef.current.textContent =
          "Your Personal Agent That Works For You and Collaborates With Other Users' Agents to Get Things Done."
        headlineRef.current.style.opacity = "1"
      }
      if (logoRef.current) logoRef.current.style.opacity = "1"
      if (subheadlineRef.current) subheadlineRef.current.style.opacity = "1"
      if (ctaRef.current) ctaRef.current.style.opacity = "1"
      if (cursorRef.current) cursorRef.current.style.display = "none"
      return
    }

    const timeline = gsap.timeline()

    // Phase 1: Cursor Blinking (0-4s, repeats during typing)
    timeline.fromTo(
      cursorRef.current,
      { opacity: 1 },
      {
        opacity: 0,
        duration: 0.8,
        repeat: -1,
      },
      0
    )

    // Phase 2: Typing Animation (0-4s)
    const headlineText =
      "Your Personal Agent That Works For You and Collaborates With Other Users' Agents to Get Things Done."
    timeline.to(
      headlineRef.current,
      {
        text: headlineText,
        duration: 4,
        ease: "none",
        onStart: () => {
          if (headlineRef.current) {
            headlineRef.current.style.opacity = "1"
          }
        },
      },
      0
    )

    // Phase 3: Hide cursor after typing (at 4s)
    timeline.to(
      cursorRef.current,
      {
        opacity: 0,
        duration: 0.1,
        pointerEvents: "none",
      },
      4
    )

    // Phase 3.1: Logo reveal (staggered, starts at 4s)
    timeline.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      4
    )

    // Phase 3.2: Subheadline reveal (starts at 4.1s)
    timeline.fromTo(
      subheadlineRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      4.1
    )

    // Phase 3.3: CTA buttons reveal (starts at 4.2s, with stagger)
    timeline.fromTo(
      ctaRef.current?.querySelectorAll("button"),
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.15,
      },
      4.2
    )

    // Set localStorage when animation completes
    timeline.call(() => {
      localStorage.setItem("introSeen", "true")
    }, undefined, 5)

    return () => {
      timeline.kill()
    }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-16">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-muted/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-muted/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 -z-15 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_70%)]" />

      <div
        ref={containerRef}
        className="mx-auto max-w-7xl px-6 w-full"
      >
        <div className="mx-auto max-w-5xl text-center">
          {/* Logo + Brand */}
          <div
            ref={logoRef}
            className="flex items-center justify-center gap-5 mb-12 opacity-0"
          >
            <Image
              src="/images/logo.png"
              alt="CoAgent4U Logo"
              width={72}
              height={72}
              className="drop-shadow-md"
              style={{ width: "72px", height: "72px" }}
            />
            <span className="text-3xl font-serif font-medium text-foreground tracking-tight italic">
              CoAgent4U
            </span>
          </div>

          {/* Headline with cursor */}
          <div className="relative inline-block w-full">
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.1] max-w-4xl mx-auto opacity-0 min-h-[200px] flex items-center justify-center"
            />
            {/* Terminal-style cursor */}
            <div
              ref={cursorRef}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-foreground animate-pulse"
              style={{
                boxShadow: "0 0 8px rgba(var(--foreground-rgb), 0.5)",
              }}
            />
          </div>

          {/* Subheadline */}
          <p
            ref={subheadlineRef}
            className="mt-8 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto opacity-0"
          >
            The Coordination Platform for Personal Agents
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0"
          >
            <Button
              size="lg"
              className="h-13 px-8 text-base font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/signin">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-13 px-8 text-base font-medium rounded-full border-2 border-foreground/20 hover:border-foreground/40 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="#use-cases">
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
