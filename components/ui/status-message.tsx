"use client"

import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface StatusMessageProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  className?: string
  duration?: number
  onClose?: () => void
}

export function StatusMessage({ type, message, className, duration = 5000, onClose }: StatusMessageProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <AlertCircle className="h-5 w-5" />,
  }

  const styles = {
    success: "bg-green-50 text-green-600 border-green-200",
    error: "bg-red-50 text-red-600 border-red-200",
    warning: "bg-yellow-50 text-yellow-600 border-yellow-200",
    info: "bg-blue-50 text-blue-600 border-blue-200",
  }

  return (
    <div className={cn("animate-fade-in-up rounded-md border p-4 flex items-start gap-3", styles[type], className)}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm">{message}</div>
      <button onClick={handleClose} className="flex-shrink-0 rounded-md p-1 hover:bg-white/20" aria-label="Close">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
