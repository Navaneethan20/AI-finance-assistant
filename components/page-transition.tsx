"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { PageLoader } from "@/components/ui/page-loader"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState(children)

  // Use refs to track actual navigation changes vs. re-renders
  const previousPathRef = useRef(pathname)
  const previousSearchParamsRef = useRef(searchParams)

  // Track route changes to trigger loading state
  useEffect(() => {
    // Only trigger animation on actual route changes, not on re-renders or input changes
    const isActualNavigation = previousPathRef.current !== pathname || previousSearchParamsRef.current !== searchParams

    if (isActualNavigation) {
      setIsLoading(true)

      // Store the current children
      setContent(children)

      // Set a timeout to simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500) // 0.5 second delay

      // Update refs
      previousPathRef.current = pathname
      previousSearchParamsRef.current = searchParams

      return () => clearTimeout(timer)
    } else {
      // For non-navigation updates, just update content without animation
      setContent(children)
    }
  }, [pathname, searchParams, children])

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <PageLoader message="Loading..." />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
