"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Users, Settings, LogOut, ChevronLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { signOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await signOut()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
      return
    }

    router.push("/auth/login")
    router.refresh()
  }

  const routes = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/admin/vacations",
      label: "Vacation Requests",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-bold text-xl text-primary">Jazati Admin</span>
        </Link>
      </div>
      <div className="flex-1 py-6 px-4">
        <nav className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to App
          </Link>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-4 border-b bg-background">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-xs sm:max-w-sm p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="ml-4 font-bold">Jazati Admin</div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
        <SidebarContent />
      </div>

      {/* Content Offset for Mobile */}
      <div className="md:hidden h-16" />
    </>
  )
}
