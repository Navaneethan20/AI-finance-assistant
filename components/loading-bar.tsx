"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

export function LoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.configure({ showSpinner: false })

    const handleRouteChangeStart = () => {
      NProgress.start()
    }

    const handleRouteChangeComplete = () => {
      NProgress.done()
    }

    // Custom CSS for NProgress
    const style = document.createElement("style")
    style.textContent = `
      #nprogress .bar {
        background: hsl(var(--primary)) !important;
        height: 3px !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Start and complete the progress bar on route change
  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  return null
}
