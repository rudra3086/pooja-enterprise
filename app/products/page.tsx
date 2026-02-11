"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { AdvancedCustomCursor } from "@/components/advanced-custom-cursor"

const products = [
  {
    id: "prod-1",
    name: "Tissue Napkin",
    description: "Premium quality napkins perfect for restaurants, hotels, and catering services. Available in various sizes and ply options.",
    features: ["1-ply and 2-ply options", "Multiple size variants", "Custom printing available", "Bulk discounts"],
    image: "/images/tissue-napkins.jpg",
    customizable: true,
  },
  {
    id: "prod-2",
    name: "Tissue Roll",
    description: "Soft and absorbent tissue rolls designed for commercial and industrial use. High sheet count per roll for cost efficiency.",
    features: ["High absorbency", "Soft texture", "Large sheet count", "Eco-friendly options"],
    image: "/images/tissue-rolls.jpg",
    customizable: true,
  },
  {
    id: "prod-3",
    name: "Ultra Soft Tissue Napkin",
    description: "Premium ultra-soft tissues for luxury hospitality experiences. Ideal for fine dining and high-end establishments.",
    features: ["Extra soft texture", "Premium quality", "Elegant presentation", "Custom branding"],
    image: "/images/facial-tissue.jpg",
    customizable: true,
  },
  {
    id: "prod-4",
    name: "Aluminium Foil",
    description: "Food-grade aluminum foil for packaging, wrapping, and kitchen applications. Available in various thicknesses and widths.",
    features: ["Food-grade certified", "Various thicknesses", "Multiple widths", "Heat resistant"],
    image: "/images/aluminum-foil.jpg",
    customizable: false,
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

export default function ProductsPage() {
  return (
    <>
      <AdvancedCustomCursor cursorSize={45} />
      <Header />
      <main className="pt-16 lg:pt-20">
        <PageTransition>
          {/* Hero Section */}
          <section className="bg-hero-tissue-watermark py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h1 className="font-serif text-4xl font-semibold sm:text-5xl">
                  Our Products
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover our range of premium tissue and packaging products designed for businesses.
                  Quality materials, competitive pricing, and custom branding options.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-8 md:grid-cols-2"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    id={product.id}
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Product Image */}
                      <div className="aspect-square lg:aspect-auto lg:w-1/2 bg-muted relative overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.customizable && (
                          <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                            Customizable
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col justify-between p-6 lg:w-1/2">
                        <div>
                          <h2 className="font-serif text-2xl font-semibold">{product.name}</h2>
                          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                            {product.description}
                          </p>
                          <ul className="mt-4 space-y-2">
                            {product.features.map((feature) => (
                              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-6">
                          <Link href="/login">
                            <Button className="w-full">Login to Order</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-muted/50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
                  Need bulk orders or custom branding?
                </h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                  Register for a business account to access wholesale pricing, custom branding options,
                  and dedicated account management.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link href="/register">
                    <Button size="lg">Create Business Account</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg">Contact Sales</Button>
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
