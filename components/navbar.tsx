"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronDown, BarChart, PieChart, FileText, User, Settings, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
        scrolled ? "bg-background/95 shadow-sm" : "bg-background/80",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMenu}>
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative group",
              isActive("/") ? "text-primary" : "text-muted-foreground",
            )}
          >
            Home
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary group relative">
                Features <ChevronDown size={16} className="transition-transform group-data-[state=open]:rotate-180" />
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
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
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/pricing"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative group",
              isActive("/pricing") ? "text-primary" : "text-muted-foreground",
            )}
          >
            Pricing
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
          </Link>

          <Link
            href="/blog"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative group",
              isActive("/blog") ? "text-primary" : "text-muted-foreground",
            )}
          >
            Blog
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
          </Link>

          <Link
            href="/support"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative group",
              isActive("/support") ? "text-primary" : "text-muted-foreground",
            )}
          >
            Support
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative group",
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground",
                )}
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />

                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white rounded-full">
                    2
                  </span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 border-2 border-transparent hover:border-primary transition-colors">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.displayName || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Standalone Logout Button */}
                <Button variant="destructive" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="p-2 rounded-md hover:bg-accent" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
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
                <Link
                  href="/profile"
                  className={cn(
                    "py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                    isActive("/profile") ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={closeMenu}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  Profile
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
                  <Button className="w-full bg-primary hover:bg-primary/90 transition-all duration-300">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
