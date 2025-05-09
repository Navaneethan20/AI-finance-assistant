"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type LoaderVariant = "primary" | "success" | "warning" | "danger" | "white"
type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl"

interface UnifiedLoaderProps {
  variant?: LoaderVariant
  size?: LoaderSize
  text?: string
  className?: string
}

export function UnifiedLoader({ variant = "primary", size = "md", text, className }: UnifiedLoaderProps) {
  // Size mappings
  const sizeMap = {
    xs: {
      container: "w-4 h-4",
      orbit: "w-4 h-4",
      dot: "w-1 h-1",
      text: "text-xs",
    },
    sm: {
      container: "w-6 h-6",
      orbit: "w-6 h-6",
      dot: "w-1.5 h-1.5",
      text: "text-sm",
    },
    md: {
      container: "w-10 h-10",
      orbit: "w-10 h-10",
      dot: "w-2 h-2",
      text: "text-base",
    },
    lg: {
      container: "w-16 h-16",
      orbit: "w-16 h-16",
      dot: "w-3 h-3",
      text: "text-lg",
    },
    xl: {
      container: "w-24 h-24",
      orbit: "w-24 h-24",
      dot: "w-4 h-4",
      text: "text-xl",
    },
  }

  // Color mappings
  const colorMap = {
    primary: {
      orbit: "border-primary/30",
      dot: "bg-primary",
    },
    success: {
      orbit: "border-green-500/30",
      dot: "bg-green-500",
    },
    warning: {
      orbit: "border-yellow-500/30",
      dot: "bg-yellow-500",
    },
    danger: {
      orbit: "border-red-500/30",
      dot: "bg-red-500",
    },
    white: {
      orbit: "border-white/30",
      dot: "bg-white",
    },
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeMap[size].container)}>
        {/* Orbital rings */}
        <motion.div
          className={cn("absolute inset-0 rounded-full border-2 border-dashed", colorMap[variant].orbit)}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <motion.div
          className={cn("absolute inset-0 rounded-full border-2", colorMap[variant].orbit)}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        {/* Center dot */}
        <motion.div
          className={cn(
            "absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            colorMap[variant].dot,
            sizeMap[size].dot,
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("absolute rounded-full", colorMap[variant].dot, sizeMap[size].dot)}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
            }}
            animate={{
              x: [0, Math.cos(i * ((2 * Math.PI) / 3)) * (Number.parseInt(sizeMap[size].container.split("w-")[1]) / 2)],
              y: [0, Math.sin(i * ((2 * Math.PI) / 3)) * (Number.parseInt(sizeMap[size].container.split("h-")[1]) / 2)],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {text && (
        <motion.p
          className={cn("mt-4 text-center", sizeMap[size].text)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
