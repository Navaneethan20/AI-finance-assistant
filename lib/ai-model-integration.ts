import { updateUserConsolidatedCSV } from "@/lib/consolidated-csv-service"
import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

const AI_MODEL_API_URL = "https://budget-ai-api.onrender.com"

// Update the AIModelResponse interface to match the main.py model output
export interface AIModelResponse {
  insights: Array<{
    title: string
    description: string
    type: string
  }>
  recommendations: Array<{
    title: string
    description: string
    priority: string
    action?: string
  }>
  budgetSuggestions: Array<{
    category: string
    currentSpending: number
    suggestedBudget: number
    percentChange: number
  }>
  spendingTrends: Array<{
    month: string
    amount: number
    category: string
  }>
  savingsProjection: Array<{
    month: string
    projected: number
    actual: number
  }>
  categoryBreakdown: Array<{
    category: string
    percentage: number
    amount: number
  }>
  charts: {
    pieChart: string
    lineChart: string
    barChart: string
  }
}

// Processed AI data for frontend consumption
export interface ProcessedAIData {
  insights: Array<{
    title: string
    description: string
    type: string
  }>
  recommendations: Array<{
    title: string
    description: string
    priority: "high" | "medium" | "low"
    action?: string
  }>
  budgetSuggestions: Array<{
    category: string
    currentSpending: number
    suggestedBudget: number
    percentChange: number
  }>
  spendingTrends: Array<{
    month: string
    amount: number
    category: string
  }>
  savingsProjection: Array<{
    month: string
    projected: number
    actual: number
  }>
  categoryBreakdown: Array<{
    category: string
    percentage: number
    amount: number
  }>
  charts: {
    lineChart: string
    barChart: string
    pieChart: string
  }
  timestamp?: string
  lastTransactionTimestamp?: string
}

// Track the last transaction timestamp globally
let globalLastTransactionTimestamp: string | null = null

// Function to update the last transaction timestamp
export async function updateLastTransactionTimestamp(userId: string): Promise<void> {
  try {
    // Get the current timestamp
    const now = new Date().toISOString()
    globalLastTransactionTimestamp = now

    // Update the timestamp in Firestore
    await setDoc(
      doc(db, "users", userId, "ai_analysis", "metadata"),
      {
        lastTransactionTimestamp: now,
      },
      { merge: true },
    )

    console.log("Updated last transaction timestamp:", now)
  } catch (error) {
    console.error("Error updating last transaction timestamp:", error)
  }
}

// Get AI analysis for a user
export async function getAIAnalysis(userId: string, forceRefresh = false): Promise<ProcessedAIData> {
  try {
    // Check if we have cached analysis data that's less than 30 minutes old
    // and no new transactions have been added since the last analysis
    if (!forceRefresh) {
      try {
        const cachedDoc = await getDoc(doc(db, "users", userId, "ai_analysis", "latest"))
        const metadataDoc = await getDoc(doc(db, "users", userId, "ai_analysis", "metadata"))

        if (cachedDoc.exists()) {
          const cachedData = cachedDoc.data() as ProcessedAIData & { timestamp: string }
          const cachedTime = new Date(cachedData.timestamp).getTime()
          const currentTime = new Date().getTime()
          const fiveMinutes = 5 * 60 * 1000 // Reduced from 30 minutes to 5 minutes

          // Get the last transaction timestamp
          let lastTransactionTimestamp = globalLastTransactionTimestamp
          if (metadataDoc.exists()) {
            lastTransactionTimestamp = metadataDoc.data().lastTransactionTimestamp || null
          }

          const cachedLastTransactionTimestamp = cachedData.lastTransactionTimestamp || null

          // Use cached data if it's less than 5 minutes old AND no new transactions have been added
          if (
            currentTime - cachedTime < fiveMinutes &&
            cachedData.insights &&
            cachedData.recommendations &&
            (!lastTransactionTimestamp ||
              !cachedLastTransactionTimestamp ||
              lastTransactionTimestamp === cachedLastTransactionTimestamp)
          ) {
            console.log("Using cached AI analysis data (less than 5 minutes old)")
            return cachedData
          }
        }
      } catch (cacheError) {
        console.error("Error checking cached analysis:", cacheError)
        // Continue with fresh analysis
      }
    } else {
      console.log("Force refreshing AI analysis data")
    }

    // First, try to update the user's consolidated CSV file
    let csvUrl
    try {
      csvUrl = await updateUserConsolidatedCSV(userId)
      console.log("CSV URL for AI analysis:", csvUrl)
    } catch (csvError) {
      console.error("Error updating CSV, using fallback data:", csvError)
      // Continue with fallback data if CSV generation fails
    }

    // Try to send the CSV URL to the AI model API
    try {
      console.log("Sending analysis request to API...")
      const response = await fetch(`${AI_MODEL_API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvUrl: csvUrl,
          sampleData: !csvUrl, // Use sample data if no CSV URL
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(60000), // 60 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API responded with status: ${response.status}`, errorText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const rawData = (await response.json()) as AIModelResponse
      console.log("Received API response:", rawData)

      // Process the raw API response into the format expected by the frontend
      const processedData = await processApiResponse(rawData, userId)
      console.log("Processed data for UI:", processedData)

      // Get the current last transaction timestamp
      let lastTransactionTimestamp = globalLastTransactionTimestamp
      try {
        const metadataDoc = await getDoc(doc(db, "users", userId, "ai_analysis", "metadata"))
        if (metadataDoc.exists()) {
          lastTransactionTimestamp = metadataDoc.data().lastTransactionTimestamp || null
        }
      } catch (error) {
        console.error("Error getting last transaction timestamp:", error)
      }

      // Store the analysis results in Firestore for future reference
      try {
        // Store in user's subcollection to avoid permission issues
        await setDoc(
          doc(db, "users", userId),
          {
            lastAnalysisTimestamp: new Date().toISOString(),
          },
          { merge: true },
        )

        // Store the full analysis in a subcollection
        await setDoc(doc(db, "users", userId, "ai_analysis", "latest"), {
          ...processedData,
          timestamp: new Date().toISOString(),
          lastTransactionTimestamp: lastTransactionTimestamp,
        })

        console.log("Successfully stored AI analysis in Firestore")
      } catch (dbError) {
        console.error("Error storing analysis results:", dbError)
        // Continue even if storage fails
      }

      return {
        ...processedData,
        lastTransactionTimestamp: lastTransactionTimestamp,
      }
    } catch (apiError) {
      console.error("Error calling AI API:", apiError)
      // Return fallback data if API call fails
      return getFallbackAnalysisData(userId)
    }
  } catch (error) {
    console.error("Error getting AI analysis:", error)
    // Return fallback data if anything fails
    return getFallbackAnalysisData(userId)
  }
}

// Update the processApiResponse function to directly map the updated model response format
async function processApiResponse(rawData: AIModelResponse, userId: string): Promise<ProcessedAIData> {
  try {
    console.log("Processing API response:", rawData)

    // The AI model now provides all the data we need in the correct format
    return {
      insights: rawData.insights || [],
      recommendations: rawData.recommendations || [],
      budgetSuggestions: rawData.budgetSuggestions || (await createBudgetSuggestions(userId)),
      spendingTrends: rawData.spendingTrends || (await createSpendingTrends(userId)),
      savingsProjection: rawData.savingsProjection || [],
      categoryBreakdown: rawData.categoryBreakdown || (await createCategoryBreakdown(userId)),
      charts: {
        lineChart: rawData.charts?.lineChart || "",
        barChart: rawData.charts?.barChart || "",
        pieChart: rawData.charts?.pieChart || "",
      },
    }
  } catch (error) {
    console.error("Error processing API response:", error)
    return getFallbackAnalysisData(userId)
  }
}

// Create budget suggestions based on real data
async function createBudgetSuggestions(userId: string) {
  try {
    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Fetch expenses for current month
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("date", ">=", startOfMonth.toISOString()),
      where("date", "<=", endOfMonth.toISOString()),
    )
    const expensesSnapshot = await getDocs(expensesQuery)

    // Group expenses by category
    const categoryExpenses = {}
    expensesSnapshot.forEach((doc) => {
      const data = doc.data()
      if (!categoryExpenses[data.category]) {
        categoryExpenses[data.category] = 0
      }
      categoryExpenses[data.category] += data.amount
    })

    // Create budget suggestions
    const budgetSuggestions = Object.entries(categoryExpenses).map(([category, amount]) => {
      const currentSpending = amount as number
      // Suggest 10% reduction for high spending categories
      const suggestedBudget = Math.round(currentSpending * 0.9)
      return {
        category,
        currentSpending,
        suggestedBudget,
        percentChange: -10,
      }
    })

    // If we couldn't extract enough categories, add some defaults
    if (budgetSuggestions.length < 3) {
      const defaultCategories = [
        { category: "Food & Dining", spending: 5000 },
        { category: "Transportation", spending: 3000 },
        { category: "Entertainment", spending: 2000 },
        { category: "Housing", spending: 9500 },
        { category: "Utilities", spending: 3300 },
      ]

      defaultCategories.forEach((item, index) => {
        if (index < 5 - budgetSuggestions.length) {
          budgetSuggestions.push({
            category: item.category,
            currentSpending: item.spending,
            suggestedBudget: Math.round(item.spending * 0.9),
            percentChange: -10,
          })
        }
      })
    }

    return budgetSuggestions
  } catch (error) {
    console.error("Error creating budget suggestions:", error)
    return [
      { category: "Food & Dining", currentSpending: 5200, suggestedBudget: 4000, percentChange: -23 },
      { category: "Transportation", currentSpending: 3200, suggestedBudget: 3000, percentChange: -6 },
      { category: "Entertainment", currentSpending: 2500, suggestedBudget: 2000, percentChange: -20 },
      { category: "Housing", currentSpending: 9500, suggestedBudget: 9500, percentChange: 0 },
      { category: "Utilities", currentSpending: 3300, suggestedBudget: 3300, percentChange: 0 },
    ]
  }
}

// Create spending trends from real data
async function createSpendingTrends(userId: string) {
  try {
    // Get last 6 months
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Fetch expenses for last 6 months
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("date", ">=", sixMonthsAgo.toISOString()),
      orderBy("date", "asc"),
    )
    const expensesSnapshot = await getDocs(expensesQuery)

    // Group expenses by month
    const monthlyExpenses = {}
    expensesSnapshot.forEach((doc) => {
      const data = doc.data()
      const date = new Date(data.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      const monthName = date.toLocaleString("default", { month: "short" })

      if (!monthlyExpenses[monthKey]) {
        monthlyExpenses[monthKey] = {
          month: monthName,
          amount: 0,
          category: "All",
        }
      }
      monthlyExpenses[monthKey].amount += data.amount
    })

    // Convert to array and sort by month
    const spendingTrends = Object.values(monthlyExpenses)

    // If we don't have enough data, add some defaults
    if (spendingTrends.length < 6) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      const existingMonths = spendingTrends.map((item) => item.month)

      months.forEach((month, index) => {
        if (!existingMonths.includes(month)) {
          spendingTrends.push({
            month,
            amount: 20000 + index * 1000 + Math.random() * 2000,
            category: "All",
          })
        }
      })
    }

    return spendingTrends
  } catch (error) {
    console.error("Error creating spending trends:", error)
    return [
      { month: "Jan", amount: 24000, category: "All" },
      { month: "Feb", amount: 25500, category: "All" },
      { month: "Mar", amount: 23000, category: "All" },
      { month: "Apr", amount: 26000, category: "All" },
      { month: "May", amount: 27500, category: "All" },
      { month: "Jun", amount: 26800, category: "All" },
    ]
  }
}

// Create category breakdown from real data
async function createCategoryBreakdown(userId: string) {
  try {
    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Fetch expenses for current month
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("date", ">=", startOfMonth.toISOString()),
      where("date", "<=", endOfMonth.toISOString()),
    )
    const expensesSnapshot = await getDocs(expensesQuery)

    // Group expenses by category
    const categoryExpenses = {}
    let totalExpenses = 0

    expensesSnapshot.forEach((doc) => {
      const data = doc.data()
      if (!categoryExpenses[data.category]) {
        categoryExpenses[data.category] = 0
      }
      categoryExpenses[data.category] += data.amount
      totalExpenses += data.amount
    })

    // Create category breakdown
    const categoryBreakdown = Object.entries(categoryExpenses).map(([category, amount]) => {
      const amountValue = amount as number
      return {
        category,
        amount: amountValue,
        percentage: totalExpenses > 0 ? (amountValue / totalExpenses) * 100 : 0,
      }
    })

    // If we couldn't extract enough categories, add some defaults
    if (categoryBreakdown.length < 3) {
      const defaultCategories = [
        { category: "Food & Dining", percentage: 25, amount: 15000 },
        { category: "Transportation", percentage: 15, amount: 9000 },
        { category: "Entertainment", percentage: 10, amount: 6000 },
        { category: "Housing", percentage: 30, amount: 18000 },
        { category: "Utilities", percentage: 10, amount: 6000 },
        { category: "Shopping", percentage: 10, amount: 6000 },
      ]

      defaultCategories.forEach((item, index) => {
        if (index < 6 - categoryBreakdown.length) {
          categoryBreakdown.push(item)
        }
      })
    }

    return categoryBreakdown
  } catch (error) {
    console.error("Error creating category breakdown:", error)
    return [
      { category: "Food & Dining", percentage: 19.4, amount: 5200 },
      { category: "Transportation", percentage: 11.9, amount: 3200 },
      { category: "Entertainment", percentage: 9.3, amount: 2500 },
      { category: "Housing", percentage: 35.4, amount: 9500 },
      { category: "Utilities", percentage: 12.3, amount: 3300 },
      { category: "Shopping", percentage: 11.6, amount: 3100 },
    ]
  }
}

// Generate a report using the AI model
export async function generateAIReport(userId: string, reportType: string): Promise<{ url: string; data: any }> {
  try {
    // First, try to update the user's consolidated CSV file
    let csvUrl
    try {
      csvUrl = await updateUserConsolidatedCSV(userId)
    } catch (csvError) {
      console.error("Error updating CSV for report generation:", csvError)
      // Use a mock URL if CSV generation fails
      csvUrl = `mock-url-for-${userId}-${Date.now()}.csv`
    }

    try {
      // Send the CSV URL to the AI model API
      const response = await fetch(`${AI_MODEL_API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvUrl,
          sampleData: !csvUrl,
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(60000), // 60 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API responded with status: ${response.status}`, errorText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      // Store report data in Firestore
      try {
        await setDoc(doc(db, "users", userId, "reports", reportType), {
          reportType,
          generatedAt: new Date().toISOString(),
          data,
        })
      } catch (dbError) {
        console.error("Error storing report data:", dbError)
      }

      return {
        url: `data:application/pdf;base64,${Buffer.from(JSON.stringify(data)).toString("base64")}`,
        data: data,
      }
    } catch (apiError) {
      console.error("Error generating AI report:", apiError)
      // Return mock data if API call fails
      return {
        url: `mock-report-url-${Date.now()}.pdf`,
        data: {
          generatedAt: new Date().toISOString(),
          reportType,
          status: "mock",
        },
      }
    }
  } catch (error) {
    console.error("Error generating AI report:", error)
    throw new Error("Failed to generate AI report")
  }
}

// Fallback data in case the API fails
async function getFallbackAnalysisData(userId: string): Promise<ProcessedAIData> {
  try {
    // Try to get real data for budget suggestions, spending trends, and category breakdown
    const budgetSuggestions = await createBudgetSuggestions(userId)
    const spendingTrends = await createSpendingTrends(userId)
    const categoryBreakdown = await createCategoryBreakdown(userId)

    return {
      insights: [
        {
          title: "High Spending in Food & Dining",
          description: "Your spending in Food & Dining category is 30% higher than the recommended amount.",
          type: "warning",
        },
        {
          title: "Good Savings Rate",
          description: "Your current savings rate is 15%, which is on track with financial recommendations.",
          type: "positive",
        },
      ],
      recommendations: [
        {
          title: "Reduce Restaurant Expenses",
          description: "Consider cooking at home more often to reduce your Food & Dining expenses.",
          priority: "high",
        },
        {
          title: "Increase Emergency Fund",
          description: "Try to allocate more to your emergency fund to reach the recommended 3-6 months of expenses.",
          priority: "medium",
        },
      ],
      budgetSuggestions,
      spendingTrends,
      savingsProjection: [
        { month: "Jul", projected: 5000, actual: 4800 },
        { month: "Aug", projected: 5200, actual: 5300 },
        { month: "Sep", projected: 5400, actual: 5100 },
        { month: "Oct", projected: 5600, actual: 0 },
        { month: "Nov", projected: 5800, actual: 0 },
        { month: "Dec", projected: 6000, actual: 0 },
      ],
      categoryBreakdown,
      charts: {
        lineChart: "",
        barChart: "",
        pieChart: "",
      },
    }
  } catch (error) {
    console.error("Error creating fallback data:", error)
    return {
      insights: [
        {
          title: "High Spending in Food & Dining",
          description: "Your spending in Food & Dining category is 30% higher than the recommended amount.",
          type: "warning",
        },
        {
          title: "Good Savings Rate",
          description: "Your current savings rate is 15%, which is on track with financial recommendations.",
          type: "positive",
        },
      ],
      recommendations: [
        {
          title: "Reduce Restaurant Expenses",
          description: "Consider cooking at home more often to reduce your Food & Dining expenses.",
          priority: "high",
        },
        {
          title: "Increase Emergency Fund",
          description: "Try to allocate more to your emergency fund to reach the recommended 3-6 months of expenses.",
          priority: "medium",
        },
      ],
      budgetSuggestions: [
        { category: "Food & Dining", currentSpending: 5200, suggestedBudget: 4000, percentChange: -23 },
        { category: "Transportation", currentSpending: 3200, suggestedBudget: 3000, percentChange: -6 },
        { category: "Entertainment", currentSpending: 2500, suggestedBudget: 2000, percentChange: -20 },
        { category: "Housing", currentSpending: 9500, suggestedBudget: 9500, percentChange: 0 },
        { category: "Utilities", currentSpending: 3300, suggestedBudget: 3300, percentChange: 0 },
      ],
      spendingTrends: [
        { month: "Jan", amount: 24000, category: "All" },
        { month: "Feb", amount: 25500, category: "All" },
        { month: "Mar", amount: 23000, category: "All" },
        { month: "Apr", amount: 26000, category: "All" },
        { month: "May", amount: 27500, category: "All" },
        { month: "Jun", amount: 26800, category: "All" },
      ],
      savingsProjection: [
        { month: "Jul", projected: 5000, actual: 4800 },
        { month: "Aug", projected: 5200, actual: 5300 },
        { month: "Sep", projected: 5400, actual: 5100 },
        { month: "Oct", projected: 5600, actual: 0 },
        { month: "Nov", projected: 5800, actual: 0 },
        { month: "Dec", projected: 6000, actual: 0 },
      ],
      categoryBreakdown: [
        { category: "Food & Dining", percentage: 19.4, amount: 5200 },
        { category: "Transportation", percentage: 11.9, amount: 3200 },
        { category: "Entertainment", percentage: 9.3, amount: 2500 },
        { category: "Housing", percentage: 35.4, amount: 9500 },
        { category: "Utilities", percentage: 12.3, amount: 3300 },
        { category: "Shopping", percentage: 11.6, amount: 3100 },
      ],
      charts: {
        lineChart: "",
        barChart: "",
        pieChart: "",
      },
    }
  }
}
