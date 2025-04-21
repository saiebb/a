"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { resetPassword } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/hooks/use-translations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { t } = useTranslations()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true)

    try {
      const { error } = await resetPassword(values.email)

      if (error) {
        toast({
          title: t("auth.resetPasswordFailed", "Reset Password Failed"),
          description: error.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Successful submission
      setIsSubmitted(true)
      toast({
        title: t("auth.resetPasswordEmailSent", "Reset Email Sent"),
        description: t("auth.resetPasswordEmailSentDescription", "Check your email for a password reset link"),
      })
    } catch (error) {
      toast({
        title: t("auth.resetPasswordFailed", "Reset Password Failed"),
        description: t("auth.unexpectedError", "An unexpected error occurred"),
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t("auth.forgotPassword", "Forgot Password")}</CardTitle>
        <CardDescription className="text-center">
          {t("auth.forgotPasswordDescription", "Enter your email to receive a password reset link")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-center space-y-4">
            <div className="bg-primary/10 text-primary p-4 rounded-md">
              <p className="font-medium">{t("auth.resetPasswordEmailSent", "Reset Email Sent")}</p>
              <p className="text-sm mt-2">
                {t(
                  "auth.resetPasswordEmailSentLong",
                  "We've sent a password reset link to your email. Please check your inbox and follow the instructions to reset your password.",
                )}
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/auth/login">{t("auth.backToLogin", "Back to Login")}</Link>
            </Button>
          </div>
        ) : (
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.sendingResetLink", "Sending reset link...")}
                  </>
                ) : (
                  t("auth.sendResetLink", "Send Reset Link")
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            {t("auth.backToLogin", "Back to Login")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
