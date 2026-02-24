"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setErrorMessage("Invalid reset link. Missing token or email.")
        setIsValidating(false)
        return
      }

      try {
        const response = await fetch("/api/auth/validate-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, email }),
        })

        const data = await response.json()

        if (data.success) {
          setIsTokenValid(true)
        } else {
          setErrorMessage(data.message || "This reset link has expired or is invalid.")
        }
      } catch (error) {
        console.error("Token validation error:", error)
        setErrorMessage("An error occurred while validating the reset link.")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.password) {
      toast({
        title: "Required field",
        description: "Please enter your new password",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
          userType: "client",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success!",
          description: "Your password has been reset. You can now login.",
        })
        setTimeout(() => router.push("/login"), 1500)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 text-center"
          >
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-muted-foreground">Validating reset link...</p>
          </motion.div>
        </div>
      </>
    )
  }

  if (!isTokenValid) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-semibold mb-2">Invalid Reset Link</h1>
                  <p className="text-muted-foreground">
                    {errorMessage}
                  </p>
                </div>

                <div className="space-y-3">
                  <Link href="/forgot-password" className="block">
                    <Button className="w-full">Request new reset link</Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">Back to Login</Button>
                  </Link>
                </div>
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
                <Lock className="h-12 w-12" />
              </div>
              <h1 className="font-serif text-4xl font-semibold leading-tight">
                Create New Password
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Your account will be secure with a strong new password
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
              <h2 className="text-3xl font-semibold">Set New Password</h2>
              <p className="text-muted-foreground">
                Create a strong password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use a mix of uppercase, lowercase, numbers, and symbols for strength
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Make sure your password is at least 8 characters with numbers, letters, and symbols
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="pt-4 border-t">
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
          </motion.div>
        </div>
      </div>
    </>
  )
}
