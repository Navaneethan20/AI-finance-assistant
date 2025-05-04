"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "fixed z-50 flex items-center gap-2 p-4 rounded-lg shadow-lg transition-all duration-300 transform",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900 border border-gray-200",
        success: "bg-green-50 text-green-900 border border-green-200",
        error: "bg-red-50 text-red-900 border border-red-200",
        warning: "bg-yellow-50 text-yellow-900 border border-yellow-200",
      },
      position: {
        topRight: "top-4 right-4",
        topLeft: "top-4 left-4",
        bottomRight: "bottom-4 right-4",
        bottomLeft: "bottom-4 left-4",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "topRight",
    },
  },
)

export interface ToastNotificationProps extends VariantProps<typeof toastVariants> {
  title: string
  message?: string
  duration?: number
  onClose?: () => void
  show: boolean
}

export function ToastNotification({
  title,
  message,
  variant,
  position,
  duration = 5000,
  onClose,
  show,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsLeaving(true)
        setTimeout(() => {
          setIsVisible(false)
          setIsLeaving(false)
          if (onClose) onClose()
        }, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [show, duration, onClose])

  if (!isVisible) return null

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsLeaving(false)
      if (onClose) onClose()
    }, 300)
  }

  const getIcon = () => {
    switch (variant) {
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

  return (
    <div
      className={cn(
        toastVariants({ variant, position }),
        isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
        "animate-slide-in-right",
      )}
      role="alert"
    >
      {getIcon()}
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      <button
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
