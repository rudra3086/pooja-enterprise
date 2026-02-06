"use client"

import React, { ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface ParallaxSectionProps {
  children: ReactNode
  backgroundImage?: string
  backgroundColor?: string
  id?: string
  className?: string
}

interface ParallaxLayerProps {
  children: ReactNode
  speed?: number
  className?: string
  direction?: "up" | "down"
}

/**
 * ParallaxSection - Main container for parallax effects
 * Manages scroll context and provides parallax layers
 */
export const ParallaxSection = React.forwardRef<
  HTMLDivElement,
  ParallaxSectionProps
>(
  (
    {
      children,
      backgroundImage,
      backgroundColor = "bg-white",
      id,
      className = "",
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        id={id}
        className={`relative w-full overflow-hidden ${backgroundColor} ${className}`}
      >
        {backgroundImage && (
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        {children}
      </section>
    )
  }
)
ParallaxSection.displayName = "ParallaxSection"

/**
 * ParallaxLayer - Child component for parallax effect
 * Moves at different speeds based on scroll
 */
export const ParallaxLayer = React.forwardRef<
  HTMLDivElement,
  ParallaxLayerProps
>(({ children, speed = 1, className = "", direction = "up" }, ref) => {
  const { scrollY } = useScroll()

  // Calculate parallax offset based on speed
  // speed < 1 means slower movement (background effect)
  // speed > 1 means faster movement (foreground effect)
  const y = useTransform(
    scrollY,
    [0, 1000],
    direction === "up" ? [0, -1000 * (speed - 1)] : [0, 1000 * (speed - 1)]
  )

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
})
ParallaxLayer.displayName = "ParallaxLayer"

/**
 * RevealOnScroll - Component for fade and slide up animation on scroll
 */
interface RevealOnScrollProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  offset?: number
}

export const RevealOnScroll = React.forwardRef<
  HTMLDivElement,
  RevealOnScrollProps
>(({ children, delay = 0, duration = 0.6, className = "", offset = 100 }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
})
RevealOnScroll.displayName = "RevealOnScroll"

/**
 * AdvancedParallaxSection - Combined component with both parallax and reveal
 */
interface AdvancedParallaxSectionProps {
  backgroundImage?: string
  backgroundSpeed?: number
  foregroundSpeed?: number
  children: ReactNode
  className?: string
  id?: string
}

export const AdvancedParallaxSection: React.FC<AdvancedParallaxSectionProps> = ({
  backgroundImage,
  backgroundSpeed = 0.5,
  foregroundSpeed = 1.2,
  children,
  className = "",
  id,
}) => {
  const { scrollY } = useScroll()

  // Background moves slower (0.5x)
  const bgY = useTransform(
    scrollY,
    [0, 2000],
    [0, -500 * (backgroundSpeed - 1)]
  )

  // Foreground moves faster (1.2x)
  const fgY = useTransform(
    scrollY,
    [0, 2000],
    [0, -500 * (foregroundSpeed - 1)]
  )

  return (
    <section
      id={id}
      className={`relative w-full overflow-hidden bg-white min-h-screen -mt-10 ${className}`}
    >
      {/* Background Layer - moves slower */}
      {backgroundImage && (
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 -z-10"
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-white/80" />
        </motion.div>
      )}

      {/* Foreground Layer - moves faster with reveal */}
      <motion.div
        style={{ y: fgY }}
        className="relative z-10 w-full h-full"
      >
        {children}
      </motion.div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/5 z-20" />
    </section>
  )
}

/**
 * ParallaxText - Specialized component for text with parallax
 */
interface ParallaxTextProps {
  children: ReactNode
  speed?: number
  className?: string
}

export const ParallaxText: React.FC<ParallaxTextProps> = ({
  children,
  speed = 1,
  className = "",
}) => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * (speed - 1)])

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
