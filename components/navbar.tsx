"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronDown, BarChart, PieChart, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/") ? "text-primary" : "text-muted-foreground",
            )}
          >
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
                Features <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/features/expense-tracking" className="flex items-center gap-2 cursor-pointer">
                  <BarChart size={16} />
                  <span>Expense Tracking</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/features/budget-planning" className="flex items-center gap-2 cursor-pointer">
                  <PieChart size={16} />
                  <span>Budget Planning</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/features/reports" className="flex items-center gap-2 cursor-pointer">
                  <FileText size={16} />
                  <span>Financial Reports</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/pricing"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/pricing") ? "text-primary" : "text-muted-foreground",
            )}
          >
            Pricing
          </Link>

          <Link
            href="/blog"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/blog") ? "text-primary" : "text-muted-foreground",
            )}
          >
            Blog
          </Link>

          <Link
            href="/support"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/support") ? "text-primary" : "text-muted-foreground",
            )}
          >
            Support
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground",
                )}
              >
                Dashboard
              </Link>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded-md hover:bg-accent" onClick={toggleMenu} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden animate-fade-in">
          <nav className="flex flex-col p-4 bg-background border-b">
            <Link
              href="/"
              className={cn(
                "py-2 text-sm font-medium transition-colors hover:text-primary",
                isActive("/") ? "text-primary" : "text-muted-foreground",
              )}
              onClick={closeMenu}
            >
              Home
            </Link>

            <div className="py-2">
              <button
                className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => document.getElementById("mobile-features")?.classList.toggle("hidden")}
              >
                Features <ChevronDown size={16} />
              </button>
              <div id="mobile-features" className="hidden pl-4 mt-2 space-y-2">
                <Link
                  href="/features/expense-tracking"
                  className="block py-1 text-sm text-muted-foreground hover:text-primary"
                  onClick={closeMenu}
                >
                  Expense Tracking
                </Link>
                <Link
                  href="/features/budget-planning"
                  className="block py-1 text-sm text-muted-foreground hover:text-primary"
                  onClick={closeMenu}
                >
                  Budget Planning
                </Link>
                <Link
                  href="/features/reports"
                  className="block py-1 text-sm text-muted-foreground hover:text-primary"
                  onClick={closeMenu}
                >
                  Financial Reports
                </Link>
              </div>
            </div>

            <Link
              href="/pricing"
              className={cn(
                "py-2 text-sm font-medium transition-colors hover:text-primary",
                isActive("/pricing") ? "text-primary" : "text-muted-foreground",
              )}
              onClick={closeMenu}
            >
              Pricing
            </Link>

            <Link
              href="/blog"
              className={cn(
                "py-2 text-sm font-medium transition-colors hover:text-primary",
                isActive("/blog") ? "text-primary" : "text-muted-foreground",
              )}
              onClick={closeMenu}
            >
              Blog
            </Link>

            <Link
              href="/support"
              className={cn(
                "py-2 text-sm font-medium transition-colors hover:text-primary",
                isActive("/support") ? "text-primary" : "text-muted-foreground",
              )}
              onClick={closeMenu}
            >
              Support
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "py-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive("/dashboard") ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Button
                  variant="destructive"
                  className="mt-2"
                  onClick={() => {
                    closeMenu()
                    handleLogout()
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/login" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMenu}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

