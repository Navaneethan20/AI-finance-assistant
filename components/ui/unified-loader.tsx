"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl"
type LoaderVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "neutral"

interface UnifiedLoaderProps {
  size?: LoaderSize
  variant?: LoaderVariant
  text?: string
  className?: string
  textClassName?: string
  showText?: boolean
}

export function UnifiedLoader({
  size = "md",
  variant = "primary",
  text = "Loading...",
  className,
  textClassName,
  showText = true,
}: UnifiedLoaderProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Size mappings
  const sizeClasses: Record<LoaderSize, string> = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }

  // Variant color mappings
  const variantClasses: Record<LoaderVariant, string> = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success-500",
    warning: "text-warning-500",
    danger: "text-danger-500",
    neutral: "text-gray-400",
  }

  // Gradient backgrounds for the loader
  const gradientBg: Record<LoaderVariant, string> = {
    primary: isDark
      ? "bg-gradient-to-r from-primary/20 to-primary/10"
      : "bg-gradient-to-r from-primary/10 to-primary/5",
    secondary: isDark
      ? "bg-gradient-to-r from-secondary/20 to-secondary/10"
      : "bg-gradient-to-r from-secondary/10 to-secondary/5",
    success: isDark
      ? "bg-gradient-to-r from-success-500/20 to-success-600/10"
      : "bg-gradient-to-r from-success-500/10 to-success-600/5",
    warning: isDark
      ? "bg-gradient-to-r from-warning-500/20 to-warning-600/10"
      : "bg-gradient-to-r from-warning-500/10 to-warning-600/5",
    danger: isDark
      ? "bg-gradient-to-r from-danger-500/20 to-danger-600/10"
      : "bg-gradient-to-r from-danger-500/10 to-danger-600/5",
    neutral: isDark
      ? "bg-gradient-to-r from-gray-700/20 to-gray-800/10"
      : "bg-gradient-to-r from-gray-200/50 to-gray-300/30",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer spinning ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-t-2 border-b-2 border-transparent",
            variantClasses[variant],
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        {/* Inner pulsing circle */}
        <motion.div
          className={cn("absolute inset-1 rounded-full", gradientBg[variant])}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Orbiting dot */}
        <motion.div
          className={cn(
            "absolute h-2 w-2 rounded-full",
            variantClasses[variant],
            size === "xs" ? "h-1 w-1" : size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          )}
          style={{
            top: "50%",
            left: "50%",
            marginTop: "-2px",
            marginLeft: "-2px",
          }}
          animate={{
            x: [
              0,
              Math.cos(0) * 20,
              Math.cos(Math.PI / 2) * 20,
              Math.cos(Math.PI) * 20,
              Math.cos((3 * Math.PI) / 2) * 20,
              0,
            ],
            y: [
              0,
              Math.sin(0) * 20,
              Math.sin(Math.PI / 2) * 20,
              Math.sin(Math.PI) * 20,
              Math.sin((3 * Math.PI) / 2) * 20,
              0,
            ],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      {showText && text && (
        <motion.p
          className={cn("mt-3 text-sm text-muted-foreground", textClassName)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
