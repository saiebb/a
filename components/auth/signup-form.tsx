"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { signUpWithEmail, signInWithProvider } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/i18n/client.tsx"
import { useTranslations } from "@/hooks/use-translations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const signupSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { isRTL } = useLanguage()
  const { t } = useTranslations()

  // Add a state to track successful signup with pending confirmation
  const [signupComplete, setSignupComplete] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Update the onSubmit function to handle the email confirmation flow
  async function onSubmit(values: SignupFormValues) {
    setIsLoading(true)

    try {
      const { data, error } = await signUpWithEmail(values.email, values.password, values.name)

      if (error) {
        toast({
          title: t("auth.signupFailed", "Signup Failed"),
          description: error.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check if confirmation is required
      if (data?.user && data.user.identities && data.user.identities.length > 0) {
        const identity = data.user.identities[0]
        if (identity.identity_data && identity.identity_data.email) {
          setRegisteredEmail(identity.identity_data.email)
        } else if (values.email) {
          setRegisteredEmail(values.email)
        }

        setSignupComplete(true)
      } else {
        // Successful signup without confirmation needed
        toast({
          title: t("auth.signupSuccess", "Signup Successful"),
          description: t("auth.accountCreated", "Your account has been created successfully!"),
        })

        // Redirect to onboarding
        router.push("/onboarding")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: t("auth.signupFailed", "Signup Failed"),
        description: t("auth.unexpectedError", "An unexpected error occurred"),
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true)
    try {
      const { error } = await signInWithProvider("google")
      if (error) {
        toast({
          title: t("auth.signupFailed", "Signup Failed"),
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("auth.signupFailed", "Signup Failed"),
        description: t("auth.unexpectedError", "An unexpected error occurred"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t("auth.createAccount", "Create an Account")}</CardTitle>
        <CardDescription className="text-center">
          {t("auth.signupDescription", "Enter your details to create a new account")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {signupComplete ? (
          <div className="space-y-4 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2">
                {t("auth.confirmationRequired", "Email Confirmation Required")}
              </h3>
              <p>{t("auth.confirmationInstructions", "We've sent a confirmation email to:")}</p>
              <p className="font-medium my-2">{registeredEmail}</p>
              <p>
                {t(
                  "auth.confirmationFollowup",
                  "Please check your inbox and click the confirmation link to activate your account.",
                )}
              </p>
            </div>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/auth/login">{t("auth.backToLogin", "Back to Login")}</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.fullName", "Full Name")}</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" autoComplete="name" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          autoComplete="new-password"
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.confirmPassword", "Confirm Password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 h-full px-3 py-2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.creatingAccount", "Creating account...")}
                  </>
                ) : (
                  t("auth.createAccount", "Create Account")
                )}
              </Button>
            </form>
          </Form>
        )}

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
          {t("auth.signUpWithGoogle", "Sign up with Google")}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            {t("auth.signIn", "Sign in")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
