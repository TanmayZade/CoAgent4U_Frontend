"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import gsap from "gsap"

// Split headline into lines so each line has a fixed position
const HEADLINE_LINES = [
  "Your Personal Agent That Works For You",
  "and Collaborates With Other Users' Agents",
  "to Get Things Done.",
]

export function HeroSection() {
  const logoRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const line3Ref = useRef<HTMLSpanElement>(null)
  const cursor1Ref = useRef<HTMLSpanElement>(null)
  const cursor2Ref = useRef<HTMLSpanElement>(null)
  const cursor3Ref = useRef<HTMLSpanElement>(null)
  const subheadlineRef = useRef<HTMLParagraphElement>(null)
  const cta1Ref = useRef<HTMLAnchorElement>(null)
  const cta2Ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const run = async () => {
      const { TextPlugin } = await import("gsap/TextPlugin")
      gsap.registerPlugin(TextPlugin)

      const lineRefs = [line1Ref, line2Ref, line3Ref]
      const cursorRefs = [cursor1Ref, cursor2Ref, cursor3Ref]

      // Make the h1 wrapper visible immediately (lines start hidden)
      cursorRefs.forEach(c => {
        if (c.current) gsap.set(c.current, { opacity: 1 })
      })

      const tl = gsap.timeline()
      const CHAR_SPEED = 0.055

      HEADLINE_LINES.forEach((line, i) => {
        const lineEl = lineRefs[i].current
        const cursorEl = cursorRefs[i].current
        const prevCursorEl = i > 0 ? cursorRefs[i - 1].current : null
        const duration = line.length * CHAR_SPEED
        // Each line starts after previous line finishes (minus a small overlap)
        const startAt = i === 0 ? 0 : `>-0.05`

        // Show this line's cursor as we start typing it
        tl.set(lineEl, { opacity: 1 }, startAt)

        // Blink this cursor while its line is typing
        const blinkTween = gsap.fromTo(
          cursorEl,
          { opacity: 1 },
          { opacity: 0, duration: 0.45, repeat: -1, yoyo: true, ease: "none" }
        )

        tl.to(
          lineEl,
          {
            duration,
            text: { value: line, delimiter: "" },
            ease: "none",
            onStart: () => blinkTween.play(),
            onComplete: () => {
              // Hide prev cursor permanently once we move to next line
              if (prevCursorEl) gsap.set(prevCursorEl, { opacity: 0 })
              // Stop blink after this line if it's not the last
              if (i < HEADLINE_LINES.length - 1) blinkTween.kill()
            },
          },
          startAt
        )
      })

      // After all lines typed: stop last cursor blink, fade it out
      tl.add(() => {
        gsap.to(cursor3Ref.current, { opacity: 0, duration: 0.4 })
      }, ">+0.15")

      // Logo pop-in
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.85, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
        "<+0.05"
      )

      // Subheadline
      tl.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
        ">-0.2"
      )

      // CTAs
      tl.fromTo(
        [cta1Ref.current, cta2Ref.current].filter(Boolean),
        { opacity: 0, scale: 0.9, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.7)", stagger: 0.12 },
        ">-0.2"
      )

      return () => tl.kill()
    }

    const cleanupPromise = run()
    return () => {
      cleanupPromise.then(fn => fn?.())
    }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-16">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-muted/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-muted/30 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6 w-full">
        <div className="mx-auto max-w-4xl">

          {/* Logo + Brand */}
          <div
            ref={logoRef}
            className="flex items-center justify-center gap-5 mb-14"
            style={{ opacity: 0 }}
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

          {/*
            Headline: each line is a fixed <div> so it never reflows.
            The text <span> fills left-to-right; the cursor <span> sits
            inline immediately after the last typed character.
          */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.2] mb-8">
            {/* Line 1 */}
            <div className="block min-h-[1.2em]">
              <span ref={line1Ref} style={{ opacity: 0 }} />
              <span
                ref={cursor1Ref}
                aria-hidden="true"
                style={{ opacity: 0 }}
                className="inline-block w-[3px] h-[0.82em] bg-foreground align-middle ml-[2px] translate-y-[-0.06em]"
              />
            </div>
            {/* Line 2 */}
            <div className="block min-h-[1.2em]">
              <span ref={line2Ref} style={{ opacity: 0 }} />
              <span
                ref={cursor2Ref}
                aria-hidden="true"
                style={{ opacity: 0 }}
                className="inline-block w-[3px] h-[0.82em] bg-foreground align-middle ml-[2px] translate-y-[-0.06em]"
              />
            </div>
            {/* Line 3 */}
            <div className="block min-h-[1.2em]">
              <span ref={line3Ref} style={{ opacity: 0 }} />
              <span
                ref={cursor3Ref}
                aria-hidden="true"
                style={{ opacity: 0 }}
                className="inline-block w-[3px] h-[0.82em] bg-foreground align-middle ml-[2px] translate-y-[-0.06em]"
              />
            </div>
          </h1>

          {/* Subheadline */}
          <p
            ref={subheadlineRef}
            className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10"
            style={{ opacity: 0 }}
          >
            The Coordination Platform for Personal Agents
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              ref={cta1Ref}
              href="/signin"
              className="inline-flex items-center justify-center h-13 px-8 text-base font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ opacity: 0 }}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              ref={cta2Ref}
              href="#use-cases"
              className="inline-flex items-center justify-center h-13 px-8 text-base font-medium rounded-full border-2 border-foreground/20 hover:border-foreground/40 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              style={{ opacity: 0 }}
            >
              View Demo
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
