"use client"

import React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AdvancedCustomCursor } from "@/components/advanced-custom-cursor"

const contactInfo = [
  {
    icon: MapPin,
    title: "Address",
    details: ["Plot No 2900/75, Shree Sardar Patel Industrial Estate", "(Old Indochem) GIDC Estate Ankleswar 393002", "Gujarat, India"],
    link: "https://maps.app.goo.gl/d1ojvPpPkTxxM3sy6",
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 9913938188"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["pooja123enterprise@gmail.com"],
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 9:00 AM - 1:00 PM"],
  },
]

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
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

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    })

    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      message: "",
    })
    setIsSubmitting(false)
  }

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
                  Contact Us
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Have questions about our products or need a quote? 
                  We&apos;re here to help. Reach out to us and we&apos;ll respond as soon as possible.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="font-serif text-2xl font-semibold">Send us a message</h2>
                  <p className="mt-2 text-muted-foreground">
                    Fill out the form below and our team will get back to you within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          placeholder="Your Company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 123 456 7890"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your requirements..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full sm:w-auto gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          Send Message
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="font-serif text-2xl font-semibold">Contact Information</h2>
                  <p className="mt-2 text-muted-foreground">
                    Prefer to reach out directly? Here are our contact details.
                  </p>

                  <div className="mt-8 space-y-6">
                    {contactInfo.map((item) => (
                      <div key={item.title} className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <item.icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.title === "Address" && item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {item.details.map((detail) => (
                                <p key={detail}>{detail}</p>
                              ))}
                            </a>
                          ) : (
                            item.details.map((detail) => (
                              <p key={detail} className="text-sm text-muted-foreground">
                                {detail}
                              </p>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Google Maps Embed */}
                  <div className="mt-8 rounded-xl overflow-hidden" style={{ height: "400px" }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.848!2d73.01932491534204!3d21.633863816328642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sPooja%20Enterprise!2sShree%20Sardar%20Patel%20Industrial%20Estate%2C%20Ankleswar!5e0!3m2!1sen!2sin!4v1707491400000"
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Pooja Enterprise Location"
                    ></iframe>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
      <Toaster />
    </>
  )
}
