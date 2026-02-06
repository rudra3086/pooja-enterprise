"use client"

import React, { useEffect, useRef, useState } from "react"

interface AdvancedCustomCursorProps {
  cursorSize?: number
  lerpFactor?: number
}

export const AdvancedCustomCursor: React.FC<AdvancedCustomCursorProps> = ({
  cursorSize = 60,
  lerpFactor = 0.22,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dynamicSize, setDynamicSize] = useState(cursorSize)
  const mousePos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })
  const hoveredElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = "none"

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && target !== hoveredElement.current) {
        hoveredElement.current = target
        
        // Get computed font size of hovered element
        const computedStyle = window.getComputedStyle(target)
        const fontSizeStr = computedStyle.fontSize
        const fontSize = parseInt(fontSizeStr, 10)
        
        // Scale cursor size based on font size
        // Min size: 30px, Max size: 120px
        // Scale ratio: fontSize * 1.5
        const newSize = Math.max(30, Math.min(120, fontSize * 1.5))
        setDynamicSize(newSize)
      }
    }

    // Animation loop with smooth Lerp (Linear Interpolation) for trailing effect
    let animationId: number
    const animate = () => {
      // Lerp calculation: smoothly interpolate toward mouse position
      const dx = mousePos.current.x - cursorPos.current.x
      const dy = mousePos.current.y - cursorPos.current.y

      cursorPos.current.x += dx * lerpFactor
      cursorPos.current.y += dy * lerpFactor

      setPosition({
        x: cursorPos.current.x,
        y: cursorPos.current.y,
      })

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseover", handleMouseOver)

    return () => {
      document.body.style.cursor = "auto"
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseover", handleMouseOver)
      cancelAnimationFrame(animationId)
    }
  }, [lerpFactor])

  return (
    <>
      {/* Fixed position cursor circle with mix-blend-mode: difference for color inversion */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-50"
        style={{
          width: `${dynamicSize}px`,
          height: `${dynamicSize}px`,
          left: "0",
          top: "0",
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease-in-out, width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          willChange: "transform, width, height",
          backgroundColor: "white",
          borderRadius: "50%",
          mixBlendMode: "difference",
          border: "2px solid rgba(0, 0, 0, 0.2)",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
        }}
      />
    </>
  )
}
