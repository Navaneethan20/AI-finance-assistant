"use client"

import type React from "react"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

export function RouteChangeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [prevPathname, setPrevPathname] = useState<string | null>(null)

  useEffect(() => {
    NProgress.configure({ showSpinner: false })
  }, [])

  // Start progress bar when navigation begins
  useEffect(() => {
    if (prevPathname !== null && prevPathname !== pathname) {
      NProgress.start()
    }

    // Complete the progress bar
    NProgress.done()

    // Update previous pathname
    setPrevPathname(pathname)
  }, [pathname, searchParams, prevPathname])

  return <>{children}</>
}

