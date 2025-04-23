"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { signInWithEmail, signInWithProvider, persistSession, resendConfirmationEmail } from "@/lib/auth"
import { getRedirectPathByRole } from "@/lib/role-redirect"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/hooks/use-translations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  error?: string | null
  redirectTo?: string
}

export function LoginForm({ error: initialError, redirectTo = "/" }: LoginFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(initialError || null)
  const { t } = useTranslations()

  // Add a new state variable for tracking email confirmation errors and resend status
  const [emailToConfirm, setEmailToConfirm] = useState<string | null>(null)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Update the onSubmit function to handle the email confirmation error
  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    setLoginError(null)
    setEmailToConfirm(null)
    setResendSuccess(false)

    try {
      console.log("Attempting to sign in with email:", values.email)

      // Attempt to sign in
      const { data, error } = await signInWithEmail(values.email, values.password)

      if (error) {
        console.error("Login error:", error)

        if (error.code === "EMAIL_NOT_CONFIRMED") {
          // Handle email confirmation error
          const emailError = error as { message: string; code: string; email: string }
          setEmailToConfirm(emailError.email || values.email)
          setLoginError(error.message)
        } else {
          setLoginError(error.message)
        }
        setIsLoading(false)
        return
      }

      // Set session persistence based on rememberMe
      await persistSession(values.rememberMe)

      // Successful login
      toast({
        title: t("auth.loginSuccess", "Login Successful"),
        description: t("auth.welcomeBack", "Welcome back!"),
      })

      console.log("Login successful, redirecting to:", redirectTo)

      // الحصول على معرف المستخدم من البيانات المُرجعة
      const userId = data?.user?.id

      if (userId) {
        console.log("Getting redirect path based on user role...")
        // الحصول على مسار إعادة التوجيه بناءً على دور المستخدم
        const rolePath = await getRedirectPathByRole(userId, redirectTo)
        console.log("Role-based redirect path:", rolePath)

        // Add a longer delay to ensure session is properly set
        // This helps prevent the issue with double login screens in Next.js 15
        console.log("Waiting for session to be properly set before redirecting...")
        setTimeout(() => {
          // Redirect to the role-specific path
          console.log("Now redirecting to:", rolePath)
          router.push(rolePath)
          router.refresh()
        }, 1000)
      } else {
        // في حالة عدم وجود معرف للمستخدم، استخدم المسار الافتراضي
        console.log("No user ID found, using default redirect path")
        setTimeout(() => {
          console.log("Now redirecting to:", redirectTo)
          router.push(redirectTo)
          router.refresh()
        }, 1000)
      }
    } catch (error) {
      console.error("Unexpected login error:", error)
      setLoginError(t("auth.unexpectedError", "An unexpected error occurred. Please try again."))
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true)
    setLoginError(null)

    try {
      const { error } = await signInWithProvider("google")
      if (error) {
        setLoginError(error.message)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Google sign-in error:", error)
      setLoginError(t("auth.unexpectedError", "An unexpected error occurred. Please try again."))
      setIsLoading(false)
    }
  }

  // Add a function to handle resending the confirmation email
  async function handleResendConfirmation() {
    if (!emailToConfirm) return

    setIsResendingEmail(true)

    try {
      const result = await resendConfirmationEmail(emailToConfirm)

      if (result.success) {
        setResendSuccess(true)
        toast({
          title: "Confirmation Email Sent",
          description: result.message,
        })
      } else {
        toast({
          title: "Failed to Resend",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error resending confirmation:", error)
      toast({
        title: "Error",
        description: "Failed to resend confirmation email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResendingEmail(false)
    }
  }



  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t("auth.signIn", "Sign In")}</CardTitle>
        <CardDescription className="text-center">
          {t("auth.signInDescription", "Enter your credentials to access your account")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loginError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("auth.loginFailed", "Login Failed")}</AlertTitle>
            <AlertDescription>
              {loginError}
              {emailToConfirm && !resendSuccess && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={isResendingEmail}
                    className="mt-2"
                  >
                    {isResendingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend Confirmation Email"
                    )}
                  </Button>
                </div>
              )}
              {resendSuccess && (
                <div className="mt-2 text-green-500 dark:text-green-400">
                  Confirmation email sent! Please check your inbox.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.email", "Email")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.password", "Password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">{t("auth.rememberMe", "Remember me")}</FormLabel>
                  </FormItem>
                )}
              />
              <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                {t("auth.forgotPassword", "Forgot password?")}
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.signingIn", "Signing in...")}
                </>
              ) : (
                t("auth.signIn", "Sign In")
              )}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t("auth.orContinueWith", "Or continue with")}</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          {t("auth.signInWithGoogle", "Sign in with Google")}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.noAccount", "Don't have an account?")}{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            {t("auth.signUp", "Sign up")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
