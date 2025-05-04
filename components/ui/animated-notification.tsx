"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationType = "success" | "error" | "warning" | "info"

interface AnimatedNotificationProps {
  message: string
  type: NotificationType
  duration?: number
  onClose?: () => void
  className?: string
}

export function AnimatedNotification({
  message,
  type = "info",
  duration = 5000,
  onClose,
  className,
}: AnimatedNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose?.()
      }, 300) // Wait for exit animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-md transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
        className,
      )}
    >
      <div className={cn("flex items-center p-4 rounded-lg shadow-md border animate-notification-enter", getBgColor())}>
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        <div className="flex-1">{message}</div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <span className="sr-only">Close</span>
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
