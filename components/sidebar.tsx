"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  BarChart3,
  Upload,
  Settings,
  HelpCircle,
  Plus,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard",
    },
    {
      title: "Transactions",
      icon: <CreditCard size={20} />,
      href: "/transactions",
    },
    {
      title: "Budget Insights",
      icon: <PiggyBank size={20} />,
      href: "/budget-insights",
    },
    {
      title: "Reports",
      icon: <BarChart3 size={20} />,
      href: "/reports",
    },
    {
      title: "Upload Statement",
      icon: <Upload size={20} />,
      href: "/upload-statement",
    },
  ]

  const secondarySidebarItems = [
    {
      title: "Settings",
      icon: <Settings size={20} />,
      href: "/settings",
    },
    {
      title: "Help & Support",
      icon: <HelpCircle size={20} />,
      href: "/support",
    },
  ]

  const quickActions = [
    {
      title: "Add Expense",
      href: "/add-expense",
    },
    {
      title: "Add Income",
      href: "/add-income",
    },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
              "flex flex-col",
            )}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
                <ChevronLeft size={20} />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 dark:from-orange-500/10 dark:to-orange-600/5 dark:hover:from-orange-500/20 dark:hover:to-orange-600/10"
                    >
                      <Plus size={14} />
                      <span className="truncate">{action.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-1">
                {sidebarItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2",
                          isActive(item.href)
                            ? "bg-gradient-to-r from-primary to-primary/80 dark:from-orange-500 dark:to-orange-600"
                            : "",
                        )}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t">
                <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Preferences</h3>
                <ul className="space-y-1">
                  {secondarySidebarItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <Button
                          variant={isActive(item.href) ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-2",
                            isActive(item.href)
                              ? "bg-gradient-to-r from-primary to-primary/80 dark:from-orange-500 dark:to-orange-600"
                              : "",
                          )}
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between">
              <ThemeToggle />
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button for large screens */}
      {!isOpen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className="fixed left-4 top-20 z-30 flex lg:flex "
              >
                <ChevronRight size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Open sidebar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

    </>
  )
}
