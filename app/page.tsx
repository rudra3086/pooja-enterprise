"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, Award, Clock, Heart, Mail, MapPin, Package, Phone, Send, Shield, Target, Truck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { AdvancedCustomCursor } from "@/components/advanced-custom-cursor"
import { useToast } from "@/hooks/use-toast"

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
    id: "prod-1",
    name: "Tissue Napkin",
    description: "Premium quality napkins for restaurants and hotels.",
    image: "/images/tissue-napkins.jpg",
    details: ["1-ply and 2-ply options", "Custom branding available", "Bulk-friendly packaging"],
  },
  {
    id: "prod-2",
    name: "Tissue Roll",
    description: "Soft and absorbent tissue rolls for commercial use.",
    image: "/images/tissue-rolls.jpg",
    details: ["High sheet count", "Soft texture and strong absorbency", "Suitable for hospitality and office use"],
  },
  {
    id: "prod-3",
    name: "Ultra Soft Tissue",
    description: "Extra soft tissues for premium hospitality experiences.",
    image: "/images/facial-tissue.jpg",
    details: ["Premium softness", "Elegant finish for premium service", "Safe for daily high-volume usage"],
  },
  {
    id: "prod-4",
    name: "Aluminium Foil",
    description: "Food-grade aluminum foil for packaging and kitchen use.",
    image: "/images/aluminum-foil.jpg",
    details: ["Food-grade quality", "Heat resistant and durable", "Available in multiple widths"],
  },
]

const aboutHighlights = [
  { value: "500+", label: "Business Clients" },
  { value: "15+", label: "Years Experience" },
  { value: "10M+", label: "Products Delivered" },
  { value: "98%", label: "Satisfaction Rate" },
]

const aboutValues = [
  {
    icon: Target,
    title: "Quality First",
    description: "We maintain strict quality standards across every product batch and delivery cycle.",
  },
  {
    icon: Heart,
    title: "Customer Focus",
    description: "We build long-term relationships through responsive support and reliable service.",
  },
  {
    icon: Award,
    title: "Integrity",
    description: "We operate transparently with clear commitments, fair pricing, and dependable timelines.",
  },
]

const aboutTimeline = [
  {
    year: "2010",
    title: "Foundation",
    description: "Pooja Enterprise started with a mission to serve businesses with dependable packaging solutions.",
  },
  {
    year: "2014",
    title: "Product Expansion",
    description: "We expanded into tissue rolls and premium napkin categories to serve more industry needs.",
  },
  {
    year: "2017",
    title: "Custom Branding",
    description: "Introduced branded packaging options for clients seeking a stronger customer experience.",
  },
  {
    year: "2020",
    title: "Digital Operations",
    description: "Moved to streamlined online workflows for faster communication and order handling.",
  },
  {
    year: "2023",
    title: "Sustainability",
    description: "Added eco-conscious product options and improved packaging efficiency standards.",
  },
]

const contactDetails = [
  {
    icon: MapPin,
    title: "Address",
    href: "https://maps.app.goo.gl/d1ojvPpPkTxxM3sy6",
    external: true,
    details: [
      "Plot No 2900/75, Shree Sardar Patel Industrial Estate",
      "(Old Indochem) GIDC Estate Ankleswar 393002",
      "Gujarat, India",
    ],
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 9913938188"],
  },
  {
    icon: Mail,
    title: "Email",
    href: "mailto:pooja123enterprise@gmail.com",
    details: ["pooja123enterprise@gmail.com"],
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 9:00 AM - 1:00 PM"],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
  },
}

const KineticText = ({ text, className = "", style = {} }: { text: string; className?: string; style?: React.CSSProperties }) => {
  return (
    <div
      className={`flex flex-nowrap justify-center gap-[0.15em] hero-kinetic-text relative px-4 py-2 rounded-lg transition-all duration-300 ${className}`}
      style={style}
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
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flippedProducts, setFlippedProducts] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subject: "Website Contact Inquiry",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Message sent",
          description: "Our team will contact you shortly.",
        })
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          message: "",
        })
      } else {
        toast({
          title: "Failed to send message",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleProductFlip = (productId: string) => {
    setFlippedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  const addressDetail = contactDetails.find((item) => item.title === "Address")
  const groupedContactDetails = contactDetails.filter((item) => item.title !== "Address")

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId)
    if (!target) return
    const headerElement = document.getElementById("site-header")
    const headerHeight = headerElement?.getBoundingClientRect().height ?? 80
    const headerOffset = headerHeight + 36
    const absoluteTop = target.getBoundingClientRect().top + window.scrollY
    const top = Math.max(0, absoluteTop - headerOffset)
    window.scrollTo({ top, behavior: "smooth" })
  }

  const resolveSectionAnchor = (hash: string) => {
    if (hash === "products") return "products-anchor"
    if (hash === "about") return "about-anchor"
    if (hash === "contact") return "contact-anchor"
    return hash
  }

  useEffect(() => {
    const scrollFromHash = () => {
      const hash = window.location.hash.replace("#", "")
      const targetId = resolveSectionAnchor(hash)
      if (!targetId) return

      let attempts = 0
      const maxAttempts = 12

      const tryScroll = () => {
        const target = document.getElementById(targetId)
        if (target) {
          const headerElement = document.getElementById("site-header")
          const headerHeight = headerElement?.getBoundingClientRect().height ?? 80
          const headerOffset = headerHeight + 36
          const absoluteTop = target.getBoundingClientRect().top + window.scrollY
          const top = Math.max(0, absoluteTop - headerOffset)
          window.scrollTo({ top, behavior: "smooth" })
          return
        }

        attempts += 1
        if (attempts < maxAttempts) {
          window.setTimeout(tryScroll, 50)
        }
      }

      window.requestAnimationFrame(tryScroll)
    }

    scrollFromHash()
    window.addEventListener("hashchange", scrollFromHash)
    return () => window.removeEventListener("hashchange", scrollFromHash)
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const media = gsap.matchMedia()

    media.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".home-scroll-stack .home-scroll-slide")
      if (!cards.length) return

      cards.forEach((card) => {
        gsap.set(card, { transformOrigin: "center top", force3D: true, willChange: "transform, opacity" })

        gsap.fromTo(
          card,
          { opacity: 0.94, y: 20, scale: 0.992 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            overwrite: "auto",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 55%",
              scrub: false,
              once: true,
              invalidateOnRefresh: false,
            },
          },
        )

        ScrollTrigger.create({
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          onLeave: () => gsap.set(card, { clearProps: "willChange" }),
          onEnterBack: () => gsap.set(card, { willChange: "transform, opacity" }),
        })
      })

      ScrollTrigger.refresh()
    })

    return () => {
      media.revert()
    }
  }, [])

  return (
    <>
      <AdvancedCustomCursor cursorSize={45} />
      <Header />
      <main className="pt-16 lg:pt-20">
        <PageTransition>
          <div className="home-scroll-stack">
          {/* Hero Section - Modern Kinetic Typography */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px", once: false }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="home-scroll-slide z-10 relative overflow-hidden bg-hero-tissue-watermark-large"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0" />
            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px", once: false }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mx-auto max-w-4xl text-center space-y-4"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-100px", once: false }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="inline-flex items-center rounded-full border-2 border-black px-6 py-2 text-sm font-bold uppercase tracking-wider"
                >
                  ● Trusted by 500+ Businesses
                </motion.div>

                {/* Main Kinetic Heading */}
                <div className="space-y-2 pt-1">
                  <KineticText
                    text="Premium Tissue & Packaging"
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ margin: "-100px", once: false }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    className="h-1 bg-black mx-auto w-24"
                  />
                  
                  <KineticText
                    text="Solutions"
                    className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  />

                </div>

                {/* Subheading */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-100px", once: false }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="text-base sm:text-lg font-medium tracking-wide mx-auto max-w-2xl leading-relaxed text-gray-600"
                >
                  Quality tissue napkins, tissue rolls, and aluminum foil products designed for businesses. 
                  Customize with your brand and deliver excellence.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-100px", once: false }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4"
                >
                  <Link
                    href="/#products"
                    onClick={(event) => {
                      event.preventDefault()
                      window.history.replaceState(null, "", "/#products")
                      scrollToSection("products-anchor")
                    }}
                  >
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
                  <Link
                    href="/#contact"
                    onClick={(event) => {
                      event.preventDefault()
                      window.history.replaceState(null, "", "/#contact")
                      scrollToSection("contact-anchor")
                    }}
                  >
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
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              >
                <div className="text-black text-xl">↓</div>
              </motion.div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px", once: false }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="home-scroll-slide z-20 relative bg-gradient-to-b from-slate-50 to-white py-24 lg:py-32 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: "-100px", once: false }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/5 via-black/2 to-transparent pointer-events-none"
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px", once: false }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-16"
              >
                <h2 className="font-display text-3xl font-bold sm:text-4xl tracking-tight">
                  Why choose Pooja Enterprise?
                </h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-100px", once: false }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="mt-4 text-muted-foreground max-w-2xl mx-auto"
                >
                  We provide end-to-end packaging solutions with a focus on quality, reliability, and customer satisfaction.
                </motion.p>
              </motion.div>


              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ margin: "-50px", once: false }}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.1 }}
                    className="group relative rounded-xl bg-card p-6 shadow-sm border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30 dark:bg-card dark:border-border"
                  >
                    <motion.div
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.1 }}
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
          </motion.section>

          {/* Products Preview Section */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px", once: false }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            id="products"
            className="home-scroll-slide z-30 relative py-24 lg:py-32 overflow-hidden bg-white"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: "-100px", once: false }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/3 via-black/1 to-transparent pointer-events-none"
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px", once: false }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-16 text-center scroll-mt-28 lg:scroll-mt-32"
                id="products-anchor"
              >
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-100px", once: false }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="font-display text-3xl sm:text-4xl font-bold tracking-tight\"
                  >
                    Our Products
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-100px", once: false }}
                    transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                    className="mt-2 text-muted-foreground"
                  >
                    Explore our range of premium packaging products
                  </motion.p>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ margin: "-50px", once: false }}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              >
                {products.map((product) => {
                  const isFlipped = !!flippedProducts[product.id]

                  return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-50px", once: false }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ y: -10 }}
                    className="product-flip-card"
                    onClick={() => toggleProductFlip(product.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleProductFlip(product.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isFlipped}
                    aria-label={`${product.name} card. ${isFlipped ? "Show front" : "Show details"}`}
                  >
                    <div className={`product-flip-inner ${isFlipped ? "is-flipped" : ""}`}>
                      <div className="product-flip-face product-flip-front product-hover-card group">
                        <div className="product-hover-media">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="product-hover-image"
                          />
                        </div>
                        <section className="product-hover-content">
                          <h3 className="product-hover-title font-display">{product.name}</h3>
                          <p className="product-hover-description">
                            {product.description}
                          </p>
                          <Link href="/login" className="product-hover-action block" onClick={(e) => e.stopPropagation()}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-center"
                              >
                                Login to Order
                              </Button>
                            </motion.div>
                          </Link>
                        </section>
                      </div>

                      <div className="product-flip-face product-flip-back">
                        <h3 className="font-display text-lg font-bold tracking-tight">{product.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                          {product.details.map((detail) => (
                            <li key={detail} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-5 space-y-3">
                          <Link href="/login" onClick={(e) => e.stopPropagation()}>
                            <Button className="w-full" size="sm">
                              Login to Order
                            </Button>
                          </Link>
                          <p className="text-center text-xs text-muted-foreground">Click card again to flip back</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </motion.section>

          {/* About Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px", once: false }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            id="about"
            className="home-scroll-slide z-60 relative py-24 lg:py-32 bg-muted"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px", once: false }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center scroll-mt-28 lg:scroll-mt-32"
                id="about-anchor"
              >
                <h2 className="font-display text-3xl font-bold sm:text-4xl tracking-tight">
                  About Pooja Enterprise
                </h2>
                <p className="mt-4 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Since 2010, we have delivered trusted packaging solutions for restaurants, hotels,
                  hospitals, and growing businesses. Our focus is simple: premium quality, reliable delivery,
                  and long-term partnerships.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial={false}
                whileInView="visible"
                viewport={{ margin: "-50px", once: false }}
                className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              >
                {aboutHighlights.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={itemVariants}
                    className="rounded-xl border border-border bg-card p-6 text-center"
                  >
                    <div className="font-serif text-4xl font-semibold lg:text-5xl">{item.value}</div>
                    <div className="mt-2 text-muted-foreground">{item.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial={false}
                whileInView="visible"
                viewport={{ margin: "-50px", once: false }}
                className="mt-14 grid gap-6 md:grid-cols-3"
              >
                {aboutValues.map((value) => (
                  <motion.div
                    key={value.title}
                    variants={itemVariants}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                      <value.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-50px", once: true }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="mt-16"
              >
                <h3 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">Our Journey</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Key milestones that shaped our growth and service quality.
                </p>

                <div className="relative mx-auto mt-8 max-w-4xl">
                  <div className="absolute left-3 top-0 h-full w-px bg-border sm:left-1/2 sm:-translate-x-px" />
                  <div className="space-y-5">
                    {aboutTimeline.map((item, index) => (
                      <motion.div
                        key={item.year}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ margin: "-40px", once: true }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06 }}
                        className="relative pl-10 sm:pl-0"
                      >
                        <div className="absolute left-1.5 top-6 h-3 w-3 rounded-full bg-primary sm:left-1/2 sm:-translate-x-1.5" />
                        <div className={`rounded-xl border border-border bg-card p-5 sm:w-[47%] ${index % 2 === 0 ? "sm:mr-auto" : "sm:ml-auto"}`}>
                          <span className="text-xs font-semibold uppercase tracking-wide text-accent">{item.year}</span>
                          <h4 className="mt-1 text-base font-semibold">{item.title}</h4>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Contact Section */}
          <section
            id="contact"
            className="home-scroll-slide z-70 relative py-24 lg:py-32 bg-white"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div
                className="text-center scroll-mt-28 lg:scroll-mt-32"
                id="contact-anchor"
              >
                <h2 className="font-display text-3xl font-bold sm:text-4xl tracking-tight">Contact Us</h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                  Reach out for bulk pricing, custom branding, and delivery support.
                </p>
              </div>

              <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
                <div
                  className="rounded-2xl border border-border bg-card p-6 sm:p-8"
                >
                  <h3 className="font-display text-2xl font-bold tracking-tight">Send us a message</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Share your requirement and our team will get back to you within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="home-name">Full Name *</Label>
                        <Input
                          id="home-name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="home-email">Email Address *</Label>
                        <Input
                          id="home-email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="home-company">Company Name</Label>
                        <Input
                          id="home-company"
                          placeholder="Your Company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="home-phone">Phone Number</Label>
                        <Input
                          id="home-phone"
                          type="tel"
                          placeholder="+91 123 456 7890"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="home-message">Message *</Label>
                      <Textarea
                        id="home-message"
                        placeholder="Tell us about your requirement..."
                        rows={5}
                        className="resize-none [field-sizing:fixed] max-h-44 overflow-y-auto"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full sm:w-auto gap-2" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                <div
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6"
                >
                  <h3 className="font-display text-xl font-bold tracking-tight">Contact Information</h3>
                  <div className="mt-4 grid gap-3">
                    {addressDetail ? (
                      <div className="rounded-lg border border-border/70 bg-background/50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                            <addressDetail.icon className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold leading-none">{addressDetail.title}</h4>
                            {addressDetail.href ? (
                              <a
                                href={addressDetail.href}
                                target={addressDetail.external ? "_blank" : undefined}
                                rel={addressDetail.external ? "noopener noreferrer" : undefined}
                                className="mt-2 block space-y-1 text-sm text-muted-foreground leading-relaxed transition-colors hover:text-primary"
                              >
                                {addressDetail.details.map((detail) => (
                                  <p key={detail} className="break-all">{detail}</p>
                                ))}
                              </a>
                            ) : (
                              <div className="mt-2 space-y-1 text-sm text-muted-foreground leading-relaxed">
                                {addressDetail.details.map((detail) => (
                                  <p key={detail} className="break-words">{detail}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-lg border border-border/70 bg-background/50 p-4">
                      <div className="space-y-4">
                        {groupedContactDetails.map((item) => (
                          <div key={item.title} className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                              <item.icon className="h-4 w-4 text-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold leading-none">{item.title}</h4>
                              {item.href ? (
                                <a
                                  href={item.href}
                                  target={item.external ? "_blank" : undefined}
                                  rel={item.external ? "noopener noreferrer" : undefined}
                                  className="mt-2 block space-y-1 text-sm text-muted-foreground leading-relaxed transition-colors hover:text-primary"
                                >
                                  {item.details.map((detail) => (
                                    <p key={detail} className="break-all">{detail}</p>
                                  ))}
                                </a>
                              ) : (
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground leading-relaxed">
                                  {item.details.map((detail) => (
                                    <p key={detail} className="break-words">{detail}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section 
            className="z-80 theme-preserve relative bg-slate-800 text-white py-14 lg:py-20 overflow-hidden dark:bg-zinc-700"
          >
            <div
              className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 via-black/5 to-transparent pointer-events-none"
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <div
                className="text-center"
              >
                <h2 className="font-display text-3xl font-bold sm:text-4xl tracking-tight">
                  Ready to get started?
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Join hundreds of businesses that trust Pooja Enterprise for their packaging needs.
                  Register now and get access to bulk pricing and custom branding options.
                </p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full sm:w-auto gap-2 group font-semibold"
                    >
                      Create Account
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link
                    href="/#contact"
                    onClick={(event) => {
                      event.preventDefault()
                      window.history.replaceState(null, "", "/#contact")
                      scrollToSection("contact-anchor")
                    }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-white text-white hover:bg-white/10 bg-transparent font-semibold"
                    >
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          </div>
        </PageTransition>
      </main>
      <Footer />
      <Toaster />
    </>
  )
}
