"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Calendar, Globe, Moon, Sun, Loader2, User as UserIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/lib/i18n/client"
import { localeNames, type Locale } from "@/lib/i18n/config"
import { useTranslations } from "@/hooks/use-translations"
// RadioGroup removed as we're using buttons instead
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import type { User as UserType, UserPreferences } from "@/types"
import { createClient } from "@/lib/auth"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    totalVacationDays: 21,
    resetDate: "january",
    firstDayOfWeek: "sunday",
    includeWeekendDays: false,
    notificationSettings: {
      vacationApproved: true,
      vacationRejected: true,
      vacationReminder: true,
      balanceNotification: true,
      statusUpdates: true,
      upcomingVacations: true
    },
    calendarIntegrations: {
      googleCalendar: false,
      outlookCalendar: false,
      appleCalendar: false
    },
    exportFormat: "ics"
  })

  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLanguage()
  const { t } = useTranslations()
  const { toast } = useToast()

  // Fetch user data when component mounts
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true)

        // 1. Get current authenticated user
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          console.log("No authenticated user found")
          toast({
            title: t("settings.error", "Error"),
            description: t("settings.notLoggedIn", "You are not logged in"),
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }

        // 2. Initialize Supabase client
        const supabase = createClient()

        // 3. Get user profile from database
        let userProfile = null
        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentUser.id)
            .single()

          if (userError) {
            if (userError.code === "PGRST116") { // No rows returned
              console.log("User not found in database, checking if email exists")

              // First check if a user with this email already exists
              const { data: existingUsers, error: emailCheckError } = await supabase
                .from("users")
                .select("id")
                .eq("email", currentUser.email || "")
                .maybeSingle()

              if (emailCheckError) {
                console.error("Error checking existing email:", emailCheckError)
                // Continue with creation attempt
              }

              if (existingUsers) {
                console.log("User with this email already exists, fetching that record instead")
                // Use the existing user record instead
                const { data: existingUserData, error: fetchExistingError } = await supabase
                  .from("users")
                  .select("*")
                  .eq("email", currentUser.email || "")
                  .single()

                if (fetchExistingError) {
                  throw new Error(`Error fetching existing user: ${JSON.stringify(fetchExistingError)}`)
                }

                userProfile = existingUserData
              } else {
                console.log("Creating new user record")
                // Create user record in the users table
                const { data: newUserData, error: createUserError } = await supabase.from("users").insert({
                  id: currentUser.id,
                  email: currentUser.email || "",
                  name: currentUser.user_metadata?.name || currentUser.email?.split("@")[0] || "User",
                  total_vacation_days: 21, // Default value
                  profile_image_url: null, // Required field but can be null
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }).select().single()

                if (createUserError) {
                  // If we still get a duplicate key error, try to fetch the existing record
                  if (createUserError.code === "23505") {
                    console.log("Duplicate key detected, fetching existing user")
                    const { data: existingUserData, error: fetchError } = await supabase
                      .from("users")
                      .select("*")
                      .eq("email", currentUser.email || "")
                      .single()

                    if (fetchError) {
                      throw new Error(`Failed to fetch existing user: ${JSON.stringify(fetchError)}`)
                    }

                    userProfile = existingUserData
                  } else {
                    throw new Error(`Failed to create user record: ${JSON.stringify(createUserError)}`)
                  }
                } else {
                  userProfile = newUserData
                }
              }
            } else {
              throw new Error(`Error fetching user data: ${JSON.stringify(userError)}`)
            }
          } else {
            userProfile = userData
          }
        } catch (error) {
          console.error("Error in user profile fetch/creation:", error)
          toast({
            title: t("settings.error", "Error"),
            description: t("settings.errorFetchingData", "Error fetching user data"),
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }

        // Set user data and update form
        setUser(userProfile)
        setFormData(prev => ({
          ...prev,
          name: userProfile.name || "",
          email: userProfile.email || "",
          totalVacationDays: userProfile.total_vacation_days || 21,
        }))

        // 4. Get or create user preferences
        let userPrefs = null
        try {
          const { data: prefsData, error: prefsError } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", userProfile.id) // Use userProfile.id instead of currentUser.id
            .single()

          if (prefsError) {
            if (prefsError.code === "PGRST116") { // No rows returned
              console.log("User preferences not found, creating default preferences")

              // Check if there are existing preferences for this user by email
              const { data: existingPrefs, error: checkPrefsError } = await supabase
                .from("user_preferences")
                .select("*")
                .eq("user_id", userProfile.id) // Use the userProfile we found/created earlier
                .maybeSingle()

              if (checkPrefsError) {
                console.error("Error checking existing preferences:", checkPrefsError)
                // Continue with creation attempt
              }

              if (existingPrefs) {
                console.log("Found existing preferences for this user")
                userPrefs = existingPrefs
              } else {
                console.log("Creating new user preferences")
                // Create default user preferences
                const { data: newPrefsData, error: createPrefsError } = await supabase.from("user_preferences").insert({
                  user_id: userProfile.id, // Use the userProfile we found/created earlier
                  theme: "light",
                  language: locale,
                  notifications_enabled: true,
                  calendar_sync_enabled: false,
                  first_day_of_week: "sunday",
                  include_weekend_days: false,
                  updated_at: new Date().toISOString(),
                }).select().single()

                if (createPrefsError) {
                  // If we get a duplicate key error, try to fetch the existing record
                  if (createPrefsError.code === "23505") {
                    console.log("Duplicate preferences detected, fetching existing preferences")
                    const { data: existingPrefsData, error: fetchPrefsError } = await supabase
                      .from("user_preferences")
                      .select("*")
                      .eq("user_id", userProfile.id)
                      .single()

                    if (fetchPrefsError) {
                      throw new Error(`Failed to fetch existing preferences: ${JSON.stringify(fetchPrefsError)}`)
                    }

                    userPrefs = existingPrefsData
                  } else {
                    throw new Error(`Failed to create user preferences: ${JSON.stringify(createPrefsError)}`)
                  }
                } else {
                  userPrefs = newPrefsData
                }
              }
            } else {
              throw new Error(`Error fetching user preferences: ${JSON.stringify(prefsError)}`)
            }
          } else {
            userPrefs = prefsData
          }
        } catch (error) {
          console.error("Error in user preferences fetch/creation:", error)
          // Continue with default preferences if there's an error
          userPrefs = {
            user_id: currentUser.id,
            theme: "light",
            language: locale,
            notifications_enabled: true,
            calendar_sync_enabled: false,
            first_day_of_week: "sunday",
            include_weekend_days: false,
          }
        }

        // Set preferences and update form
        setUserPreferences(userPrefs)
        setFormData(prev => ({
          ...prev,
          firstDayOfWeek: (userPrefs.first_day_of_week as "sunday" | "monday" | "saturday") || "sunday",
          includeWeekendDays: userPrefs.include_weekend_days || false,
          notificationSettings: {
            vacationApproved: userPrefs.notifications_enabled,
            vacationRejected: userPrefs.notifications_enabled,
            vacationReminder: userPrefs.notifications_enabled,
            balanceNotification: userPrefs.notifications_enabled,
            statusUpdates: userPrefs.notifications_enabled,
            upcomingVacations: userPrefs.notifications_enabled
          },
          calendarIntegrations: {
            googleCalendar: userPrefs.calendar_sync_enabled,
            outlookCalendar: false,
            appleCalendar: false
          }
        }))
      } catch (error) {
        console.error("Unhandled error in fetchUserData:", error)
        toast({
          title: t("settings.error", "Error"),
          description: t("settings.unexpectedError", "An unexpected error occurred"),
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [locale, t, toast])

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle nested input changes (for notification settings, etc.)
  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentObj = prev[parent as keyof typeof prev]
      if (typeof parentObj === 'object' && parentObj !== null) {
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [field]: value
          }
        }
      }
      return prev
    })
  }

  // Toggle theme between light and dark
  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    // Save the theme preference to database if user is logged in
    if (user && userPreferences) {
      try {
        const supabase = createClient()
        await supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            theme: newTheme,
            updated_at: new Date().toISOString()
          })

        // Update local state
        setUserPreferences(prev => prev ? {
          ...prev,
          theme: newTheme as "light" | "dark"
        } : null)

        toast({
          title: t("settings.themeChanged", "Theme Changed"),
          description: newTheme === "dark"
            ? t("settings.darkModeEnabled", "Dark mode enabled")
            : t("settings.lightModeEnabled", "Light mode enabled")
        })
      } catch (error) {
        console.error("Error saving theme preference:", error)
      }
    }
  }

  // Toggle language between English and Arabic
  const toggleLanguage = async () => {
    const newLocale = locale === "en" ? "ar" : "en"
    setLocale(newLocale)

    // Save the language preference to database if user is logged in
    if (user && userPreferences) {
      try {
        const supabase = createClient()
        await supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            language: newLocale,
            updated_at: new Date().toISOString()
          })

        // Update local state
        setUserPreferences(prev => prev ? {
          ...prev,
          language: newLocale
        } : null)

        toast({
          title: t("settings.languageChanged", "Language Changed"),
          description: newLocale === "ar"
            ? "تم تغيير اللغة إلى العربية"
            : "Language changed to English"
        })
      } catch (error) {
        console.error("Error saving language preference:", error)
      }
    }
  }

  // Handle save
  const handleSave = async (section: string) => {
    // Get current user
    const currentUser = await getCurrentUser()
    if (!currentUser || !user) {
      toast({
        title: t("settings.error", "Error"),
        description: t("settings.notLoggedIn", "You are not logged in"),
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()

      if (section === "profile") {
        try {
          // First update the auth user metadata
          const { error: authError } = await supabase.auth.updateUser({
            data: { name: formData.name }
          })

          if (authError) {
            console.error("Error updating auth user:", authError)
            // Continue anyway, we can still update the database record
          }

          // Update user profile in the database
          const { error: profileError } = await supabase
            .from("users")
            .update({
              name: formData.name,
              email: formData.email,
              total_vacation_days: formData.totalVacationDays,
              updated_at: new Date().toISOString()
            })
            .eq("id", user.id)

          if (profileError) {
            throw new Error(`Failed to update profile: ${JSON.stringify(profileError)}`)
          }

          // Update local state
          setUser(prev => prev ? {
            ...prev,
            name: formData.name,
            email: formData.email,
            total_vacation_days: formData.totalVacationDays
          } : null)
        } catch (error) {
          console.error("Profile update error:", error)
          throw error
        }
      } else if (section === "preferences") {
        try {
          // Update user preferences
          const { error: prefsError } = await supabase
            .from("user_preferences")
            .upsert({
              user_id: user.id,
              theme: theme as "light" | "dark",
              language: locale,
              first_day_of_week: formData.firstDayOfWeek as "sunday" | "monday" | "saturday",
              include_weekend_days: formData.includeWeekendDays,
              notifications_enabled: formData.notificationSettings.statusUpdates,
              calendar_sync_enabled: formData.calendarIntegrations.googleCalendar,
              updated_at: new Date().toISOString()
            })

          if (prefsError) {
            throw new Error(`Failed to update preferences: ${JSON.stringify(prefsError)}`)
          }

          // Update local state
          setUserPreferences(prev => prev ? {
            ...prev,
            theme: theme as "light" | "dark",
            language: locale,
            first_day_of_week: formData.firstDayOfWeek as "sunday" | "monday" | "saturday",
            include_weekend_days: formData.includeWeekendDays,
            notifications_enabled: formData.notificationSettings.statusUpdates,
            calendar_sync_enabled: formData.calendarIntegrations.googleCalendar
          } : null)
        } catch (error) {
          console.error("Preferences update error:", error)
          throw error
        }
      } else if (section === "notifications") {
        try {
          // Update notification settings
          const { error: notifError } = await supabase
            .from("user_preferences")
            .upsert({
              user_id: user.id,
              notifications_enabled: formData.notificationSettings.statusUpdates,
              updated_at: new Date().toISOString()
            })

          if (notifError) {
            throw new Error(`Failed to update notifications: ${JSON.stringify(notifError)}`)
          }

          // Update local state
          setUserPreferences(prev => prev ? {
            ...prev,
            notifications_enabled: formData.notificationSettings.statusUpdates
          } : null)
        } catch (error) {
          console.error("Notifications update error:", error)
          throw error
        }
      } else if (section === "integrations") {
        try {
          // Update calendar integrations
          const { error: calError } = await supabase
            .from("user_preferences")
            .upsert({
              user_id: user.id,
              calendar_sync_enabled: formData.calendarIntegrations.googleCalendar,
              updated_at: new Date().toISOString()
            })

          if (calError) {
            throw new Error(`Failed to update integrations: ${JSON.stringify(calError)}`)
          }

          // Update local state
          setUserPreferences(prev => prev ? {
            ...prev,
            calendar_sync_enabled: formData.calendarIntegrations.googleCalendar
          } : null)
        } catch (error) {
          console.error("Integrations update error:", error)
          throw error
        }
      }

      toast({
        title: t("settings.success", "Success"),
        description: t("settings.savedSuccessfully", "Settings saved successfully")
      })
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error)
      toast({
        title: t("settings.error", "Error"),
        description: error instanceof Error ? error.message : t("settings.errorSaving", "Error saving settings"),
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-6 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("settings.loading", "Loading settings...")}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold">{t("settings.title", "Settings")}</h1>

        <Tabs defaultValue="profile" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("settings.profile", "Profile")}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">{t("settings.notifications", "Notifications")}</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{t("settings.preferences", "Preferences")}</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{t("settings.integrations", "Integrations")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.profileInformation", "Profile Information")}</CardTitle>
                <CardDescription>
                  {t("settings.profileDescription", "Update your personal information")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("settings.fullName", "Full Name")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("settings.emailAddress", "Email Address")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-title">{t("settings.jobTitle", "Job Title")}</Label>
                  <Input
                    id="job-title"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">{t("settings.department", "Department")}</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange('department', value)}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder={t("settings.selectDepartment", "Select department")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSave('profile')} disabled={isSaving}>
                  {isSaving ? t("settings.saving", "Saving...") : t("settings.saveChanges", "Save Changes")}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("settings.vacationAllowance", "Vacation Allowance")}</CardTitle>
                <CardDescription>
                  {t("settings.vacationAllowanceDescription", "Manage your annual vacation days")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="total-days">{t("settings.totalVacationDays", "Total Vacation Days")}</Label>
                  <Input
                    id="total-days"
                    type="number"
                    value={formData.totalVacationDays.toString()}
                    onChange={(e) => handleInputChange('totalVacationDays', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    {t("settings.totalVacationDaysDescription", "This is your annual vacation allowance.")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-date">{t("settings.resetDate", "Reset Date")}</Label>
                  <Select
                    value={formData.resetDate}
                    onValueChange={(value) => handleInputChange('resetDate', value)}
                  >
                    <SelectTrigger id="reset-date">
                      <SelectValue placeholder={t("settings.selectMonth", "Select month")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">January 1st</SelectItem>
                      <SelectItem value="april">April 1st</SelectItem>
                      <SelectItem value="july">July 1st</SelectItem>
                      <SelectItem value="october">October 1st</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.resetDateDescription", "Your vacation days will reset on this date each year.")}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSave('profile')} disabled={isSaving}>
                  {isSaving ? t("settings.saving", "Saving...") : t("settings.saveChanges", "Save Changes")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.appPreferences", "App Preferences")}</CardTitle>
                <CardDescription>
                  {t("settings.appPreferencesDescription", "Customize your app experience")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("settings.display", "Display")}</h3>
                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("settings.language", "Language")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("settings.currentLanguage", "Current language")}: {localeNames[locale]}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleLanguage}
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        {locale === "en" ? "العربية" : "English"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("settings.theme", "Theme")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("settings.currentTheme", "Current theme")}:
                          {theme === "dark"
                            ? t("settings.darkMode", "Dark Mode")
                            : t("settings.lightMode", "Light Mode")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                        className="flex items-center gap-2"
                      >
                        {theme === "dark"
                          ? <Sun className="h-4 w-4" />
                          : <Moon className="h-4 w-4" />}
                        {theme === "dark"
                          ? t("settings.lightMode", "Light Mode")
                          : t("settings.darkMode", "Dark Mode")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("settings.calendarSettings", "Calendar")}</h3>
                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="first-day">{t("settings.firstDayOfWeek", "First Day of Week")}</Label>
                    <Select
                      value={formData.firstDayOfWeek}
                      onValueChange={(value) => handleInputChange('firstDayOfWeek', value)}
                    >
                      <SelectTrigger id="first-day">
                        <SelectValue placeholder={t("settings.selectDay", "Select day")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekend-days">{t("settings.includeWeekendDays", "Include Weekend Days")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.includeWeekendDaysDescription", "Count weekend days in vacation calculations")}
                      </p>
                    </div>
                    <Switch
                      id="weekend-days"
                      checked={formData.includeWeekendDays}
                      onCheckedChange={(checked) => handleInputChange('includeWeekendDays', checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSave('preferences')} disabled={isSaving}>
                  {isSaving ? t("settings.saving", "Saving...") : t("settings.saveChanges", "Save Changes")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.notificationSettings", "Notification Settings")}</CardTitle>
                <CardDescription>
                  {t("settings.notificationDescription", "Manage how you receive notifications")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("settings.emailNotifications", "Email Notifications")}</h3>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="vacation-approved">{t("settings.vacationApproved", "Vacation Approved")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "settings.vacationApprovedDescription",
                          "Receive an email when your vacation request is approved",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="vacation-approved"
                      checked={formData.notificationSettings.vacationApproved}
                      onCheckedChange={(checked) => handleNestedInputChange('notificationSettings', 'vacationApproved', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="vacation-rejected">{t("settings.vacationRejected", "Vacation Rejected")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "settings.vacationRejectedDescription",
                          "Receive an email when your vacation request is rejected",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="vacation-rejected"
                      checked={formData.notificationSettings.vacationRejected}
                      onCheckedChange={(checked) => handleNestedInputChange('notificationSettings', 'vacationRejected', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="vacation-reminder">{t("settings.vacationReminders", "Vacation Reminders")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "settings.vacationRemindersDescription",
                          "Receive a reminder email before your vacation starts",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="vacation-reminder"
                      checked={formData.notificationSettings.vacationReminder}
                      onCheckedChange={(checked) => handleNestedInputChange('notificationSettings', 'vacationReminder', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="balance-notification">
                        {t("settings.balanceNotifications", "Balance Notifications")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "settings.balanceNotificationsDescription",
                          "Receive notifications when your vacation balance is running low",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="balance-notification"
                      checked={formData.notificationSettings.balanceNotification}
                      onCheckedChange={(checked) => handleNestedInputChange('notificationSettings', 'balanceNotification', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("settings.inAppNotifications", "In-App Notifications")}</h3>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="status-updates">{t("settings.statusUpdates", "Status Updates")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "settings.statusUpdatesDescription",
                          "Receive notifications for vacation request status changes",
                        )}
                      </p>
                    </div>
                    <Switch
                      id="status-updates"
                      checked={formData.notificationSettings.statusUpdates}
                      onCheckedChange={(checked) => handleNestedInputChange('notificationSettings', 'statusUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="upcoming-vacations">
                        {t("settings.upcomingVacations", "Upcoming Vacations")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.upcomingVacationsDescription", "Receive reminders about your upcoming vacations")}
                      </p>
                    </div>
                    <Switch
                      id="upcoming-vacations"
                      checked={formData.notificationSettings.upcomingVacations}
                      onCheckedChange={(checked) => handleNestedInputChange('notificationSettings', 'upcomingVacations', checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSave('notifications')} disabled={isSaving}>
                  {isSaving ? t("settings.saving", "Saving...") : t("settings.saveChanges", "Save Changes")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.calendarIntegrations", "Calendar Integrations")}</CardTitle>
                <CardDescription>
                  {t("settings.calendarIntegrationsDescription", "Connect your calendar to sync vacation days")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="google-calendar">{t("settings.googleCalendar", "Google Calendar")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.googleCalendarDescription", "Sync your vacations with Google Calendar")}
                      </p>
                    </div>
                    <Switch
                      id="google-calendar"
                      checked={formData.calendarIntegrations.googleCalendar}
                      onCheckedChange={(checked) => handleNestedInputChange('calendarIntegrations', 'googleCalendar', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="outlook-calendar">{t("settings.outlookCalendar", "Outlook Calendar")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.outlookCalendarDescription", "Sync your vacations with Outlook Calendar")}
                      </p>
                    </div>
                    <Switch
                      id="outlook-calendar"
                      checked={formData.calendarIntegrations.outlookCalendar}
                      onCheckedChange={(checked) => handleNestedInputChange('calendarIntegrations', 'outlookCalendar', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="apple-calendar">{t("settings.appleCalendar", "Apple Calendar")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.appleCalendarDescription", "Sync your vacations with Apple Calendar")}
                      </p>
                    </div>
                    <Switch
                      id="apple-calendar"
                      checked={formData.calendarIntegrations.appleCalendar}
                      onCheckedChange={(checked) => handleNestedInputChange('calendarIntegrations', 'appleCalendar', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("settings.exportOptions", "Export Options")}</h3>
                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="export-format">{t("settings.exportFormat", "Export Format")}</Label>
                    <Select
                    value={formData.exportFormat}
                    onValueChange={(value) => handleInputChange('exportFormat', value)}
                  >
                      <SelectTrigger id="export-format">
                        <SelectValue placeholder={t("settings.selectFormat", "Select format")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ics">ICS (iCalendar)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" className="w-full">
                    {t("settings.exportVacationData", "Export Vacation Data")}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSave('integrations')} disabled={isSaving}>
                  {isSaving ? t("settings.saving", "Saving...") : t("settings.saveChanges", "Save Changes")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

