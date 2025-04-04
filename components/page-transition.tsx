"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleStart = () => {
      setIsLoading(true)
    }

    const handleComplete = () => {
      timeout = setTimeout(() => {
        setIsLoading(false)
      }, 300) // Small delay to ensure smooth transition
    }

    // Simulate route change start
    handleStart()

    // Simulate route change complete
    handleComplete()

    return () => {
      clearTimeout(timeout)
    }
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

