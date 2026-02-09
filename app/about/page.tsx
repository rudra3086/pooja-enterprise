"use client"

import { motion } from "framer-motion"
import { Target, Eye, Heart, Award, Users, TrendingUp } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { AdvancedCustomCursor } from "@/components/advanced-custom-cursor"

const timeline = [
  {
    year: "2010",
    title: "Foundation",
    description: "Pooja Enterprise was founded with a vision to provide quality packaging solutions to businesses.",
  },
  {
    year: "2014",
    title: "Expansion",
    description: "Expanded our product line to include tissue rolls and ultra-soft tissue napkins.",
  },
  {
    year: "2017",
    title: "Custom Branding",
    description: "Introduced custom branding services allowing businesses to personalize tissue products with their logos.",
  },
  {
    year: "2020",
    title: "Digital Transformation",
    description: "Launched our B2B platform enabling seamless online ordering and account management.",
  },
  {
    year: "2023",
    title: "Sustainability Initiative",
    description: "Introduced eco-friendly product lines and sustainable packaging options.",
  },
]

const values = [
  {
    icon: Target,
    title: "Quality First",
    description: "We never compromise on the quality of our products, ensuring they meet the highest standards.",
  },
  {
    icon: Heart,
    title: "Customer Focus",
    description: "Our customers are at the heart of everything we do. Their success is our success.",
  },
  {
    icon: Award,
    title: "Integrity",
    description: "We conduct our business with honesty, transparency, and ethical practices.",
  },
]

const stats = [
  { value: "500+", label: "Business Clients" },
  { value: "15+", label: "Years Experience" },
  { value: "10M+", label: "Products Delivered" },
  { value: "98%", label: "Satisfaction Rate" },
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

export default function AboutPage() {
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
                  About Pooja Enterprise
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your trusted partner in premium packaging solutions since 2010.
                  We believe in quality, integrity, and customer satisfaction.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Story Section */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-sm font-medium text-accent uppercase tracking-wider">Our Story</span>
                  <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                    Building trust through quality
                  </h2>
                  <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Pooja Enterprise was founded with a simple yet powerful vision: to provide businesses 
                      with packaging solutions that reflect their commitment to quality. What started as a 
                      small family business has grown into a trusted B2B partner for hundreds of companies.
                    </p>
                    <p>
                      Over the years, we have expanded our product range, embraced innovation, and built 
                      lasting relationships with our clients. Our journey is marked by continuous improvement 
                      and an unwavering dedication to customer satisfaction.
                    </p>
                    <p>
                      Today, we serve restaurants, hotels, hospitals, and businesses across multiple industries, 
                      providing them with premium tissue products and aluminum foil solutions that meet their 
                      unique needs.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-muted rounded-2xl aspect-square flex items-center justify-center"
                >
                  <div className="text-center text-muted-foreground/50">
                    <Users className="h-24 w-24 mx-auto" />
                    <p className="mt-4 text-sm">Company Image</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="bg-primary text-primary-foreground py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold">Our Mission</h3>
                  <p className="mt-4 text-primary-foreground/70 leading-relaxed">
                    To provide businesses with premium, cost-effective packaging solutions that enhance 
                    their brand image and meet the highest standards of quality and sustainability.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex flex-col"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold">Our Vision</h3>
                  <p className="mt-4 text-primary-foreground/70 leading-relaxed">
                    To be the leading B2B packaging solutions provider, recognized for our commitment 
                    to quality, innovation, and sustainable business practices.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Our Values</h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                  The principles that guide everything we do
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-12 grid gap-8 md:grid-cols-3"
              >
                {values.map((value) => (
                  <motion.div
                    key={value.title}
                    variants={itemVariants}
                    className="text-center p-6 rounded-xl bg-card border border-border"
                  >
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-muted">
                      <value.icon className="h-7 w-7 text-foreground" />
                    </div>
                    <h3 className="mt-4 font-semibold text-lg">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="bg-muted/50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Our Journey</h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                  Milestones that have shaped our growth
                </p>
              </motion.div>

              <div className="mt-12 relative">
                {/* Timeline Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

                <div className="space-y-8">
                  {timeline.map((item, index) => (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`relative flex items-center ${
                        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      <div className="flex-1 md:w-1/2" />
                      
                      {/* Timeline Dot */}
                      <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary md:-translate-x-1.5 z-10" />
                      
                      {/* Content */}
                      <div className={`flex-1 ml-12 md:ml-0 md:w-1/2 ${
                        index % 2 === 0 ? "md:pl-12" : "md:pr-12"
                      }`}>
                        <div className="bg-card p-6 rounded-xl border border-border">
                          <span className="text-sm font-semibold text-accent">{item.year}</span>
                          <h3 className="mt-2 font-semibold text-lg">{item.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    className="text-center"
                  >
                    <div className="font-serif text-4xl font-semibold lg:text-5xl">{stat.value}</div>
                    <div className="mt-2 text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}
