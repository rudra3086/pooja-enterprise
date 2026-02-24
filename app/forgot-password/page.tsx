"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Required field",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userType: "client" }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        toast({
          title: "Email sent!",
          description: "Check your email for password reset instructions.",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to process your request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardContent className="pt-6 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground text-left">
                  <p className="font-medium mb-2">Next steps:</p>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Check your email inbox</li>
                    <li>Click the reset link</li>
                    <li>Create your new password</li>
                  </ol>
                </div>

                <p className="text-xs text-muted-foreground">
                  Link expires in 1 hour. Check your spam folder if you don't see the email.
                </p>

                <Link href="/login" className="block">
                  <Button className="w-full">Back to Login</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-background flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/icon.svg"
                alt="Pooja Enterprise"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="font-serif text-2xl font-semibold">Pooja Enterprise</span>
            </Link>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-12 w-12" />
              </div>
              <h1 className="font-serif text-4xl font-semibold leading-tight">
                Reset Your Password
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-primary-foreground/60"
          >
            <p>Pooja Enterprise © 2024</p>
            <p>Premium B2B Tissue Solutions</p>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full max-w-md space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">Forgot Password?</h2>
              <p className="text-muted-foreground">
                No worries. We'll help you reset it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The email associated with your account
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Remember your password?
              </p>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Don't have an account?</p>
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create one for free
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
