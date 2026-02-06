"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Package, Shield, Truck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { AdvancedParallaxSection } from "@/components/parallax-section"
import { AdvancedCustomCursor } from "@/components/advanced-custom-cursor"

const features = [
  {
    icon: Package,
    title: "Premium Quality",
    description: "High-quality tissue products and aluminum foil that meet international standards.",
  },
  {
    icon: Shield,
    title: "Certified Products",
    description: "All our products are certified for safety and quality compliance.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Fast and reliable B2B delivery across all major business hubs.",
  },
  {
    icon: Users,
    title: "Custom Branding",
    description: "Personalize tissue products with your company logo and branding.",
  },
]

const products = [
  {
    id: "tissue-napkin",
    name: "Tissue Napkin",
    description: "Premium quality napkins for restaurants and hotels.",
    image: "/images/tissue-napkins.jpg",
  },
  {
    id: "tissue-roll",
    name: "Tissue Roll",
    description: "Soft and absorbent tissue rolls for commercial use.",
    image: "/images/tissue-rolls.jpg",
  },
  {
    id: "ultra-soft",
    name: "Ultra Soft Tissue",
    description: "Extra soft tissues for premium hospitality experiences.",
    image: "/images/facial-tissue.jpg",
  },
  {
    id: "aluminium-foil",
    name: "Aluminium Foil",
    description: "Food-grade aluminum foil for packaging and kitchen use.",
    image: "/images/aluminum-foil.jpg",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const productCardVariants = {
  initial: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const featureHoverVariants = {
  hover: {
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

const shadowVariants = {
  hover: {
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
}

const KineticText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <div
      className={`flex flex-nowrap justify-center gap-[0.15em] hero-kinetic-text relative px-4 py-2 rounded-lg transition-all duration-300 ${className}`}
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, fontWeight: 400, color: "black" }}
          animate={{ opacity: 1, y: 0, fontWeight: 700, color: "black" }}
          transition={{
            duration: 0.5,
            delay: index * 0.02,
            ease: "easeOut",
          }}
          className="inline-block cursor-circle text-black font-black select-none"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <AdvancedCustomCursor cursorSize={45} />
      <Header />
      <main className="pt-16 lg:pt-20">
        <PageTransition>
          {/* Hero Section - Modern Kinetic Typography */}
          <section className="relative overflow-hidden bg-white">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8 lg:py-48">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="mx-auto max-w-4xl text-center space-y-8"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center rounded-full border-2 border-black px-6 py-2 text-sm font-bold uppercase tracking-wider"
                  style={{ transform: "translateY(-100px)" }}
                >
                  ● Trusted by 500+ Businesses
                </motion.div>

                {/* Main Kinetic Heading */}
                <div className="space-y-6 -mt-8">
                  <KineticText
                    text="Premium Tissue & Packaging"
                    className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-tight"
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="h-1 bg-black mx-auto w-24"
                  />
                  
                  <KineticText
                    text="Solutions"
                    className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-tight"
                  />
                </div>

                {/* Subheading */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-lg sm:text-xl font-semibold tracking-wide mx-auto max-w-2xl leading-relaxed"
                >
                  Quality tissue napkins, tissue rolls, and aluminum foil products designed for businesses. 
                  Customize with your brand and deliver excellence.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-8"
                >
                  <Link href="/products">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto gap-2 border-black text-black hover:bg-black hover:text-white bg-transparent"
                      >
                        View Products
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/contact">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto gap-2 border-black text-black hover:bg-black hover:text-white bg-transparent"
                      >
                        Contact Us
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              >
                <div className="text-black text-2xl">↓</div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2 className="font-display text-3xl font-bold sm:text-4xl tracking-tight">
                  Why choose Pooja Enterprise?
                </h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                  We provide end-to-end packaging solutions with a focus on quality, reliability, and customer satisfaction.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    whileHover="hover"
                    custom={{ hover: featureHoverVariants.hover }}
                    className="group relative rounded-xl bg-card p-6 shadow-sm border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30"
                  >
                    <motion.div
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="mt-4 font-display font-bold transition-colors duration-300 group-hover:text-primary">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed transition-colors duration-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Products Preview Section */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-between gap-4 sm:flex-row"
              >
                <div>
                  <h2 className="font-display text-3xl font-bold sm:text-4xl tracking-tight transition-colors duration-300 hover:text-primary cursor-default">
                    Our Products
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Explore our range of premium packaging products
                  </p>
                </div>
                <Link href="/products">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button variant="outline" className="gap-2 group bg-transparent">
                      View All
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={productCardVariants}
                    initial="initial"
                    whileInView="visible"
                    whileHover={{ 
                      y: -12,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    viewport={{ once: true }}
                    className="group relative overflow-hidden rounded-xl bg-card border border-border/40 transition-all duration-300 hover:border-primary/20"
                    style={{
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none"
                      style={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-50 relative overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-display font-bold text-stone-900 transition-colors duration-300 group-hover:text-primary">{product.name}</h3>
                      <p className="mt-2 text-sm text-stone-600">
                        {product.description}
                      </p>
                      <Link href="/login" className="mt-5 block">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Login to Order
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Parallax Effect Showcase */}
          <AdvancedParallaxSection
            backgroundImage="/images/tissue-napkins.jpg"
            backgroundSpeed={0.5}
            foregroundSpeed={1.2}
            className="py-32 lg:py-40"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                {/* Text Content */}
                <div className="space-y-6">
                  <div>
                    <span className="text-sm font-semibold uppercase tracking-widest text-neutral-600">
                      Experience The Difference
                    </span>
                    <h2 className="mt-3 font-playfair text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight">
                      Crafted for Excellence
                    </h2>
                  </div>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    Our packaging solutions are engineered with precision and care. Each product 
                    undergoes rigorous quality testing to ensure it meets international standards 
                    and exceeds customer expectations.
                  </p>
                  <ul className="space-y-4">
                    {["Premium Materials", "Eco-Friendly Options", "Custom Designs", "Fast Delivery"].map((item) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center text-neutral-700"
                      >
                        <span className="inline-block w-2 h-2 bg-neutral-900 rounded-full mr-3" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Image with Parallax Layer */}
                <div className="hidden lg:block">
                  <motion.div
                    className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                    whileInView={{ scale: 1 }}
                    initial={{ scale: 0.9 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <Image
                      src="/images/tissue-rolls.jpg"
                      alt="Product Excellence"
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                </div>
              </div>
            </div>
          </AdvancedParallaxSection>

          {/* CTA Section */}
          <section className="bg-primary text-primary-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2 className="font-display text-3xl font-bold sm:text-4xl tracking-tight">
                  Ready to get started?
                </h2>
                <p className="mt-4 text-primary-foreground/70 max-w-2xl mx-auto">
                  Join hundreds of businesses that trust Pooja Enterprise for their packaging needs.
                  Register now and get access to bulk pricing and custom branding options.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link href="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        size="lg"
                        variant="secondary"
                        className="w-full sm:w-auto gap-2 group"
                      >
                        Create Account
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/contact">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                      >
                        Contact Sales
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}
