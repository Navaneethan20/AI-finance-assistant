"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { exportToCSV } from "@/lib/csv-export"

export function useCSV() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const downloadCSV = async (filename: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to download CSV files",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating(true)

      // Generate CSV content
      const csvContent = await exportToCSV(user.uid)

      // Create a blob from the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename || `transactions-${new Date().toISOString().split("T")[0]}.csv`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return url
    } catch (error) {
      console.error("Error downloading CSV:", error)
      toast({
        title: "Error",
        description: "Failed to download CSV file",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    downloadCSV,
    isGenerating,
  }
}
