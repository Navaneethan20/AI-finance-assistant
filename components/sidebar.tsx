"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  PlusCircle,
  Upload,
  ListOrdered,
  PieChart,
  BarChart4,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface SidebarLink {
  href: string
  label: string
  icon: React.ElementType
}

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const links: SidebarLink[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/add-expense",
      label: "Add Expense",
      icon: PlusCircle,
    },
    {
      href: "/upload-statement",
      label: "Upload Statement",
      icon: Upload,
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: ListOrdered,
    },
    {
      href: "/budget-insights",
      label: "Budget Insights",
      icon: PieChart,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: BarChart4,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
    },
  ]

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 md:hidden shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-background border-r transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Logo />
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <Button variant="destructive" className="w-full justify-start gap-3" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

