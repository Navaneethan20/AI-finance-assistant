"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getAIAnalysis } from "@/lib/ai-model-integration"
import { updateUserConsolidatedCSV } from "@/lib/consolidated-csv-service"
import { useToast } from "@/components/ui/use-toast"

// This component is used to integrate with financial models
// It runs in the background and doesn't render anything visible
export function FinancialModelsIntegration() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [hasShownError, setHasShownError] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    // When user logs in, update CSV files and run AI analysis
    const runInitialAnalysis = async () => {
      if (!user || isAnalyzing) return

      setIsAnalyzing(true)

      try {
        // First, try to update the consolidated CSV file
        try {
          await updateUserConsolidatedCSV(user.uid)
          console.log("Successfully updated consolidated CSV")
        } catch (csvError) {
          console.error("Error updating consolidated CSV:", csvError)
          // Continue with AI analysis even if CSV update fails
        }

        // Then, run the AI analysis
        try {
          const analysisResult = await getAIAnalysis(user.uid)
          console.log("Initial AI analysis completed successfully", analysisResult)

          // Show a success toast
          toast({
            title: "Analysis Complete",
            description: "Your financial insights are ready to view.",
            variant: "default",
          })
        } catch (aiError) {
          console.error("Error running AI analysis:", aiError)
          // AI analysis failed, but we'll continue

          // Show an error toast
          toast({
            title: "Analysis Issue",
            description: "We encountered an issue analyzing your data. Using fallback insights.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error in financial models integration:", error)

        // Show a toast only once per session if there's a critical error
        if (!hasShownError) {
          setHasShownError(true)
          toast({
            title: "Notice",
            description: "Some financial insights may be limited. We're working on it.",
            variant: "default",
          })
        }
      } finally {
        setIsAnalyzing(false)
      }
    }

    // Run the initial analysis when the user logs in
    if (user) {
      // Add a small delay to ensure auth is fully established
      const timer = setTimeout(() => {
        runInitialAnalysis()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [user, toast, hasShownError, isAnalyzing])

  // This component doesn't render anything visible
  return null
}
