"use client"

import React, { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"

interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  badge?: string
}

interface PremiumPortfolioSectionProps {
  items?: PortfolioItem[]
  title?: string
  subtitle?: string
}

const defaultItems: PortfolioItem[] = [
  {
    id: "1",
    title: "Premium Tissue Quality",
    description: "Engineered excellence with international certifications",
    image: "/images/tissue-napkins.jpg",
    badge: "Best Quality",
  },
  {
    id: "2",
    title: "Sustainable Packaging",
    description: "Eco-friendly solutions for modern businesses",
    image: "/images/tissue-rolls.jpg",
    badge: "Eco-Certified",
  },
  {
    id: "3",
    title: "Custom Branding",
    description: "Personalized products with your brand identity",
    image: "/images/aluminum-foil.jpg",
    badge: "Customizable",
  },
]

export const PremiumPortfolioSection: React.FC<PremiumPortfolioSectionProps> = ({
  items = defaultItems,
  title = "Portfolio Excellence",
  subtitle = "Curated collection of our premium offerings",
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  // Parallax transforms for different layers
  const bgY = useTransform(scrollYProgress, [0, 1], [100, -100])
  const fgY = useTransform(scrollYProgress, [0, 1], [-100, 100])
  const textY = useTransform(scrollYProgress, [0, 1], [50, -50])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  }

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative w-full py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white"
    >
      {/* Decorative blur background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: bgY }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          style={{ y: bgY }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-sm font-semibold text-blue-900 tracking-wide uppercase">
              ✨ Featured Collection
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ y: textY }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 mb-4 leading-tight"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Portfolio Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="group relative"
              style={{
                y: index % 2 === 0 ? bgY : fgY,
              }}
            >
              {/* Card Container with layered effect */}
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="relative h-96 rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Background Image with parallax */}
                <motion.div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay gradient */}
                  <motion.div
                    initial={{ opacity: 0.4 }}
                    whileHover={{ opacity: 0.6 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"
                  />
                </motion.div>

                {/* Content that floats above image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative h-full flex flex-col justify-between p-6 lg:p-8 text-white z-20"
                >
                  {/* Badge */}
                  {item.badge && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="inline-flex w-fit px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wider uppercase"
                    >
                      {item.badge}
                    </motion.div>
                  )}

                  <div>
                    {/* Title with floating effect */}
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.25 }}
                      className="text-2xl lg:text-3xl font-bold mb-2 leading-tight"
                    >
                      {item.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-sm lg:text-base text-white/80 leading-relaxed"
                    >
                      {item.description}
                    </motion.p>
                  </div>

                  {/* Call-to-action button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors duration-300 text-sm font-semibold w-fit"
                  >
                    Learn More
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* Ambient light effect on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 pointer-events-none"
                />
              </motion.div>

              {/* Shadow card effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-400/20 to-transparent blur-2xl -z-10 transition-all duration-300 group-hover:from-blue-400/30 group-hover:to-purple-400/20"
                whileHover={{ scale: 1.05 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 lg:mt-20"
        >
          <p className="text-lg text-slate-600 mb-6">
            Ready to experience premium products?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
          >
            Explore All Products
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  )
}
