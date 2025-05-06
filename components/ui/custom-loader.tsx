"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type LoaderType = "dots" | "pulse" | "spinner" | "skeleton" | "wave" | "sparkles"

interface CustomLoaderProps {
  type?: LoaderType
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
  textClassName?: string
}

export function CustomLoader({ type = "dots", size = "md", text, className, textClassName }: CustomLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const renderLoader = () => {
    switch (type) {
      case "dots":
        return (
          <div className={cn("flex items-center space-x-2", className)}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn("rounded-full bg-primary", sizeClasses[size])}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )

      case "pulse":
        return (
          <motion.div
            className={cn("rounded-full bg-primary", sizeClasses[size], className)}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        )

      case "spinner":
        return (
          <motion.div
            className={cn("border-4 border-primary/30 border-t-primary rounded-full", sizeClasses[size], className)}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )

      case "skeleton":
        return (
          <div className={cn("space-y-2", className)}>
            <motion.div
              className="h-3 bg-muted rounded"
              initial={{ backgroundPosition: "-200px 0" }}
              animate={{ backgroundPosition: ["200px 0", "-200px 0"] }}
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--background) 0%, var(--muted) 20%, var(--muted-foreground) 40%, var(--muted) 60%, var(--background) 80%)",
                backgroundSize: "200px 100%",
                backgroundRepeat: "no-repeat",
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <motion.div
              className="h-3 bg-muted rounded w-3/4"
              initial={{ backgroundPosition: "-200px 0" }}
              animate={{ backgroundPosition: ["200px 0", "-200px 0"] }}
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--background) 0%, var(--muted) 20%, var(--muted-foreground) 40%, var(--muted) 60%, var(--background) 80%)",
                backgroundSize: "200px 100%",
                backgroundRepeat: "no-repeat",
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 0.2 }}
            />
          </div>
        )

      case "wave":
        return (
          <div className={cn("flex items-center gap-1", className)}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={cn("bg-primary rounded-full w-1", size === "sm" ? "h-3" : size === "md" ? "h-5" : "h-8")}
                animate={{ height: ["40%", "100%", "40%"] }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )

      case "sparkles":
        return (
          <div className={cn("relative", className)}>
            <motion.div
              className={cn("rounded-full bg-primary", sizeClasses[size])}
              animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            {[45, 90, 135, 180, 225, 270, 315, 360].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                }}
                animate={{
                  x: [0, Math.cos((angle * Math.PI) / 180) * 15],
                  y: [0, Math.sin((angle * Math.PI) / 180) * 15],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        )

      default:
        return (
          <motion.div
            className={cn("border-4 border-primary/30 border-t-primary rounded-full", sizeClasses[size], className)}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderLoader()}
      {text && <p className={cn("text-sm text-muted-foreground", textClassName)}>{text}</p>}
    </div>
  )
}
