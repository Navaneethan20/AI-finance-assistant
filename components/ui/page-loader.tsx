"use client"

import { UnifiedLoader } from "@/components/ui/unified-loader"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface PageLoaderProps {
  message?: string
  className?: string
  fullScreen?: boolean
}

export function PageLoader({ message = "Loading...", className, fullScreen = true }: PageLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" : "w-full py-12",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <UnifiedLoader size="lg" text={message} />

        <motion.div
          className="mt-4 max-w-md text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground">
            We're preparing your experience. This will only take a moment.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
