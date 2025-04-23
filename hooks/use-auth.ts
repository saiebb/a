"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/hooks/use-translations"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslations()

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Auth error:", error)
          setUser(null)
        } else {
          setUser(currentUser)
        }
      } catch (err) {
        console.error("Unexpected auth error:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Initial check
    checkAuth()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)
      
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    // Clean up listener on unmount
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Sign out error:", error)
        toast({
          title: t("auth.signOutFailed", "Sign Out Failed"),
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: t("auth.signedOut", "Signed Out"),
          description: t("auth.signedOutSuccess", "You have been signed out successfully."),
        })
        setUser(null)
        router.push("/auth/login")
        router.refresh()
      }
    } catch (err) {
      console.error("Unexpected sign out error:", err)
      toast({
        title: t("auth.signOutFailed", "Sign Out Failed"),
        description: t("auth.unexpectedError", "An unexpected error occurred. Please try again."),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
}
