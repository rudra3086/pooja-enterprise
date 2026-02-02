"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Package, Shield, Truck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"

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

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-16 lg:pt-20">
        <PageTransition>
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted via-background to-background" />
            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mx-auto max-w-3xl text-center"
              >
                <span className="inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
                  Trusted by 500+ businesses
                </span>
                <h1 className="font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Premium packaging solutions for your business
                </h1>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
                  Quality tissue napkins, tissue rolls, and aluminum foil products designed for businesses. 
                  Customize with your brand and deliver excellence to your customers.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link href="/products">
                    <Button size="lg" className="w-full sm:w-auto gap-2 group">
                      View Products
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                      Contact Us
                    </Button>
                  </Link>
                </div>
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
                <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
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
                    className="group relative rounded-xl bg-card p-6 shadow-sm border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
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
                  <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
                    Our Products
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Explore our range of premium packaging products
                  </p>
                </div>
                <Link href="/products">
                  <Button variant="outline" className="gap-2 group bg-transparent">
                    View All
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
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
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg"
                  >
<div className="aspect-square bg-muted relative overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    <div className="p-5">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.description}
                      </p>
                      <Link href="/login" className="mt-4 block">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          Login to Order
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

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
                <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
                  Ready to get started?
                </h2>
                <p className="mt-4 text-primary-foreground/70 max-w-2xl mx-auto">
                  Join hundreds of businesses that trust Pooja Enterprise for their packaging needs.
                  Register now and get access to bulk pricing and custom branding options.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full sm:w-auto gap-2 group"
                    >
                      Create Account
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                    >
                      Contact Sales
                    </Button>
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
