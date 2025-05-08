"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getAIAnalysis, type ProcessedAIData } from "@/lib/ai-model-integration"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  LineChart,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
  Lightbulb,
  Target,
  Bell,
  CreditCard,
  Landmark,
  Info,
} from "lucide-react"
import { collection, query, where, getDocs, orderBy, onSnapshot, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CustomLoader } from "@/components/ui/custom-loader"

// Animation variants for elements
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function BudgetInsights() {
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [aiData, setAiData] = useState<ProcessedAIData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastTransactionTime, setLastTransactionTime] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Financial metrics state derived from AI data
  const [financialMetrics, setFinancialMetrics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savingsAmount: 0,
    savingsRate: 0,
    budgetHealth: "good", // good, warning, critical
    monthlyChange: {
      income: 0,
      expenses: 0,
      savings: 0,
    },
  })

  // Listen for transaction timestamp changes
  useEffect(() => {
    if (!user) return

    // Set up a listener for the transaction timestamp
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "ai_analysis", "metadata"),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          const newTimestamp = data.lastTransactionTimestamp

          // If the timestamp has changed, we need to refresh the data
          if (newTimestamp && newTimestamp !== lastTransactionTime) {
            console.log("Transaction timestamp changed, refreshing data")
            setLastTransactionTime(newTimestamp)
            fetchData(true) // Force refresh
          }
        }
      },
      (error) => {
        console.error("Error listening for transaction timestamp changes:", error)
      },
    )

    return () => unsubscribe()
  }, [user, lastTransactionTime])

  // Fetch real-time financial data from Firestore for the time range
  const fetchFinancialData = useCallback(async () => {
    if (!user) return null

    try {
      // Get date range based on selected time range
      const now = new Date()
      let startDate, endDate

      if (timeRange === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      } else if (timeRange === "quarter") {
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
      } else if (timeRange === "year") {
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
      }

      // Get previous period for comparison
      let prevStartDate, prevEndDate
      if (timeRange === "month") {
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
      } else if (timeRange === "quarter") {
        const quarter = Math.floor(now.getMonth() / 3)
        prevStartDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        prevEndDate = new Date(now.getFullYear(), quarter * 3, 0)
      } else if (timeRange === "year") {
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1)
        prevEndDate = new Date(now.getFullYear() - 1, 11, 31)
      }

      // Fetch current period expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        where("date", ">=", startDate.toISOString()),
        where("date", "<=", endDate.toISOString()),
        orderBy("date", "asc"),
      )
      const expensesSnapshot = await getDocs(expensesQuery)
      let totalExpenses = 0
      expensesSnapshot.forEach((doc) => {
        totalExpenses += doc.data().amount
      })

      // Fetch current period income
      const incomeQuery = query(
        collection(db, "income"),
        where("userId", "==", user.uid),
        where("date", ">=", startDate.toISOString()),
        where("date", "<=", endDate.toISOString()),
        orderBy("date", "asc"),
      )
      const incomeSnapshot = await getDocs(incomeQuery)
      let totalIncome = 0
      incomeSnapshot.forEach((doc) => {
        totalIncome += doc.data().amount
      })

      // Fetch previous period expenses for comparison
      const prevExpensesQuery = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        where("date", ">=", prevStartDate.toISOString()),
        where("date", "<=", prevEndDate.toISOString()),
      )
      const prevExpensesSnapshot = await getDocs(prevExpensesQuery)
      let prevTotalExpenses = 0
      prevExpensesSnapshot.forEach((doc) => {
        prevTotalExpenses += doc.data().amount
      })

      // Fetch previous period income for comparison
      const prevIncomeQuery = query(
        collection(db, "income"),
        where("userId", "==", user.uid),
        where("date", ">=", prevStartDate.toISOString()),
        where("date", "<=", prevEndDate.toISOString()),
      )
      const prevIncomeSnapshot = await getDocs(prevIncomeQuery)
      let prevTotalIncome = 0
      prevIncomeSnapshot.forEach((doc) => {
        prevTotalIncome += doc.data().amount
      })

      // Calculate financial metrics
      const savingsAmount = totalIncome - totalExpenses
      const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0
      const prevSavingsAmount = prevTotalIncome - prevTotalExpenses

      // Calculate monthly changes
      const incomeChange = prevTotalIncome > 0 ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100 : 0
      const expensesChange = prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0
      const savingsChange = prevSavingsAmount > 0 ? ((savingsAmount - prevSavingsAmount) / prevSavingsAmount) * 100 : 0

      // Determine budget health based on savings rate
      let budgetHealth = "good"
      if (savingsRate < 10) {
        budgetHealth = "critical"
      } else if (savingsRate < 20) {
        budgetHealth = "warning"
      }

      // Update financial metrics state
      const metrics = {
        totalIncome,
        totalExpenses,
        savingsAmount,
        savingsRate,
        budgetHealth,
        monthlyChange: {
          income: incomeChange,
          expenses: expensesChange,
          savings: savingsChange,
        },
      }

      setFinancialMetrics(metrics)
      return metrics
    } catch (error) {
      console.error("Error fetching financial data:", error)
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive",
      })
      return null
    }
  }, [user, timeRange, toast])

  // Extract financial metrics from AI insights if Firestore data is unavailable
  const extractMetricsFromAI = useCallback((aiData: ProcessedAIData) => {
    const metrics = {
      totalIncome: 0,
      totalExpenses: 0,
      savingsAmount: 0,
      savingsRate: 0,
      budgetHealth: "good" as "good" | "warning" | "critical",
      monthlyChange: {
        income: 0,
        expenses: 0,
        savings: 0,
      },
    }

    if (aiData.insights) {
      aiData.insights.forEach((insight) => {
        if (insight.title === "Total Income" && insight.description) {
          const match = insight.description.match(/₹([\d,]+)/)
          if (match) {
            metrics.totalIncome = Number.parseFloat(match[1].replace(/,/g, ""))
          }
        } else if (insight.title === "Total Expenses" && insight.description) {
          const match = insight.description.match(/₹([\d,]+)/)
          if (match) {
            metrics.totalExpenses = Number.parseFloat(match[1].replace(/,/g, ""))
          }
        } else if (insight.title === "Savings Rate" && insight.description) {
          const match = insight.description.match(/(\d+\.?\d*)%/)
          if (match) {
            metrics.savingsRate = Number.parseFloat(match[1])
          }
        } else if (insight.title === "Net Cashflow" && insight.description) {
          const match = insight.description.match(/₹([\d,]+)/)
          if (match) {
            metrics.savingsAmount = Number.parseFloat(match[1].replace(/,/g, ""))
          }
        } else if (insight.title === "Monthly Trend" && insight.description) {
          const match = insight.description.match(/(\d+\.?\d*)%/)
          if (match) {
            const changeValue = Number.parseFloat(match[1])
            metrics.monthlyChange.expenses = insight.description.includes("increased") ? changeValue : -changeValue
          }
        }
      })
    }

    // If savings amount wasn't found, calculate it
    if (metrics.savingsAmount === 0) {
      metrics.savingsAmount = metrics.totalIncome - metrics.totalExpenses
    }

    // Calculate budget health based on savings rate
    if (metrics.savingsRate >= 20) {
      metrics.budgetHealth = "good"
    } else if (metrics.savingsRate >= 10) {
      metrics.budgetHealth = "warning"
    } else {
      metrics.budgetHealth = "critical"
    }

    return metrics
  }, [])

  // Fetch AI data and financial metrics
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch financial data and AI analysis in parallel
        const [financialData, analysisResult] = await Promise.all([
          fetchFinancialData(),
          getAIAnalysis(user.uid, forceRefresh),
        ])

        console.log("Budget insights page received AI data:", analysisResult)
        setAiData(analysisResult)

        // Use financial data from Firestore if available, otherwise extract from AI insights
        if (!financialData) {
          const metricsFromAI = extractMetricsFromAI(analysisResult)
          setFinancialMetrics(metricsFromAI)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load budget insights. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load budget insights",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user, fetchFinancialData, extractMetricsFromAI, toast],
  )

  // Fetch data when component mounts or time range changes
  useEffect(() => {
    fetchData()
  }, [fetchData, timeRange])

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData(true) // Force refresh
  }

  // Function to get budget health color
  const getBudgetHealthColor = (health: string) => {
    switch (health) {
      case "good":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Function to get change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUp className="h-3 w-3 mr-1" />
          <span>{change.toFixed(1)}%</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowDown className="h-3 w-3 mr-1" />
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      )
    } else {
      return <span className="text-gray-500">0%</span>
    }
  }

  // Function to render AI model charts with animation
  const renderModelChart = (base64Data: string | undefined, title: string, icon: React.ReactNode) => {
    if (!base64Data)
      return (
        <Card className="flex items-center justify-center h-[300px]">
          <CardContent className="text-center p-6">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
              {icon}
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-2">No chart data available</p>
          </CardContent>
        </Card>
      )

    return (
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="h-full">
        <Card className="overflow-hidden h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-lg overflow-hidden">
              <img
                src={`data:image/png;base64,${base64Data}`}
                alt={`${title} Chart`}
                className="w-full h-auto object-contain"
                style={{ minHeight: "300px" }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  }

  // Calculate days until due
  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const dueDate = new Date(dateString)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Generate upcoming bills based on recent expenses (if AI doesn't provide them)
  const getUpcomingBills = useCallback(() => {
    if (!aiData?.categoryBreakdown) return []

    // Use the category breakdown to generate expected bills
    return aiData.categoryBreakdown
      .filter(
        (category) => ["Housing", "Utilities", "Subscriptions"].includes(category.category) || category.percentage > 10,
      )
      .slice(0, 4)
      .map((category, index) => {
        const today = new Date()
        const dueDate = new Date(today)
        dueDate.setDate(today.getDate() + 7 + index * 5) // Spread due dates over the next month

        return {
          name: category.category,
          amount: Math.round(category.amount / 2), // Approximate monthly bill amount
          dueDate: dueDate.toISOString(),
          isPaid: false,
        }
      })
  }, [aiData])

  // Get top spending categories
  const getTopCategories = useCallback(() => {
    if (!aiData?.categoryBreakdown) return []

    return [...aiData.categoryBreakdown]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
      .map((category) => ({
        ...category,
        isOverspent: category.amount > financialMetrics.totalExpenses * 0.25, // If over 25% of total expenses
      }))
  }, [aiData, financialMetrics.totalExpenses])

  return (
    <AuthenticatedLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        {/* Header with filters */}
        <motion.div variants={slideUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Insights</h1>
            <p className="text-muted-foreground mt-1">AI-powered analysis of your financial data</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-1"
            >
              {isRefreshing ? (
                <>
                  <CustomLoader type="spinner" size="sm" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              <Button
                variant={timeRange === "month" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange("month")}
              >
                Month
              </Button>
              <Button
                variant={timeRange === "quarter" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange("quarter")}
              >
                Quarter
              </Button>
              <Button
                variant={timeRange === "year" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange("year")}
              >
                Year
              </Button>
            </div>

            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </motion.div>

        {/* Error display if any */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Section */}
        <motion.div variants={slideUp}>
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Financial Summary</CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getBudgetHealthColor(financialMetrics.budgetHealth)}`}></div>
                  <span className="text-sm font-medium capitalize">{financialMetrics.budgetHealth}</span>
                </div>
              </div>
              <CardDescription>
                {timeRange === "month" ? "Current month" : timeRange === "quarter" ? "Current quarter" : "Current year"}{" "}
                overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatePresence>
                  {isLoading ? (
                    <motion.div
                      className="flex flex-col items-center justify-center py-12 space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <CustomLoader type="dots" size="lg" text="Analyzing your financial data..." />
                      <div className="text-center max-w-md">
                        <h3 className="text-lg font-medium mb-2">Crunching the numbers</h3>
                        <p className="text-sm text-muted-foreground">
                          Our AI is analyzing your financial patterns and preparing personalized insights.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Existing metrics display */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Income</p>
                            <h3 className="text-2xl font-bold mt-1">
                              ₹{financialMetrics.totalIncome.toLocaleString()}
                            </h3>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Wallet className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center text-sm">
                          {getChangeIndicator(financialMetrics.monthlyChange.income)}
                          <span className="ml-1 text-muted-foreground">vs last {timeRange}</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Expenses</p>
                            <h3 className="text-2xl font-bold mt-1">
                              ₹{financialMetrics.totalExpenses.toLocaleString()}
                            </h3>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
                            <CreditCard className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center text-sm">
                          {getChangeIndicator(financialMetrics.monthlyChange.expenses)}
                          <span className="ml-1 text-muted-foreground">vs last {timeRange}</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Savings</p>
                            <h3 className="text-2xl font-bold mt-1">
                              ₹{financialMetrics.savingsAmount.toLocaleString()}
                            </h3>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Landmark className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center text-sm">
                          {getChangeIndicator(financialMetrics.monthlyChange.savings)}
                          <span className="ml-1 text-muted-foreground">vs last {timeRange}</span>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div variants={slideUp}>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full border-b pb-px mb-4 bg-transparent">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                Overview
              </TabsTrigger>
              <TabsTrigger value="spending" className="data-[state=active]:bg-background">
                Spending Breakdown
              </TabsTrigger>
              <TabsTrigger value="budget" className="data-[state=active]:bg-background">
                Budget vs Actual
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-background">
                Trends & Insights
              </TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-background">
                Savings Goals
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* AI Model Charts */}
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="flex items-center justify-center h-[400px]">
                      <CustomLoader type="skeleton" text="Loading expense distribution..." />
                    </Card>
                    <Card className="flex items-center justify-center h-[400px]">
                      <CustomLoader type="skeleton" text="Loading income vs expenses chart..." />
                    </Card>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {renderModelChart(
                      aiData?.charts?.pieChart,
                      "Expense Distribution",
                      <PieChart className="h-4 w-4" />,
                    )}

                    {renderModelChart(
                      aiData?.charts?.lineChart,
                      "Income vs Expenses",
                      <LineChart className="h-4 w-4" />,
                    )}
                  </div>
                )}
              </div>

              {/* Top Spending Categories */}
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Top Spending Categories
                    </CardTitle>
                    <CardDescription>Your highest expense categories this {timeRange}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getTopCategories().map((category, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{category.category}</h4>
                                  {category.isOverspent && (
                                    <Badge variant="destructive" className="text-xs">
                                      Overspent
                                    </Badge>
                                  )}
                                </div>
                                <span className="font-semibold">₹{category.amount.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full ${category.isOverspent ? "bg-red-500" : "bg-primary"}`}
                                  style={{ width: `${Math.min(100, category.percentage)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                <span>{category.percentage.toFixed(1)}% of total</span>
                                {category.isOverspent && <span className="text-red-500">Consider reducing</span>}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              
            </TabsContent>

            {/* Spending Breakdown Tab */}
            <TabsContent value="spending" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Category Breakdown Chart */}
                {isLoading ? (
                  <Skeleton className="h-[500px] w-full" />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                        <CardDescription>Your spending by category</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="rounded-lg overflow-hidden">
                          {aiData?.charts?.pieChart ? (
                            <img
                              src={`data:image/png;base64,${aiData.charts.pieChart}`}
                              alt="Category Breakdown Chart"
                              className="w-full h-auto object-contain"
                              style={{ minHeight: "400px" }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] bg-muted/50">
                              <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No chart data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Category Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                    <CardDescription>Detailed breakdown of your expenses</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-background">
                          <tr className="border-b">
                            <th className="text-left p-4">Category</th>
                            <th className="text-right p-4">Amount</th>
                            <th className="text-right p-4">% of Total</th>
                            <th className="text-right p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading ? (
                            Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <tr key={i} className="border-b">
                                  <td className="p-4">
                                    <Skeleton className="h-6 w-24" />
                                  </td>
                                  <td className="p-4">
                                    <Skeleton className="h-6 w-20 ml-auto" />
                                  </td>
                                  <td className="p-4">
                                    <Skeleton className="h-6 w-12 ml-auto" />
                                  </td>
                                  <td className="p-4">
                                    <Skeleton className="h-6 w-16 ml-auto" />
                                  </td>
                                </tr>
                              ))
                          ) : aiData?.categoryBreakdown && aiData.categoryBreakdown.length > 0 ? (
                            aiData.categoryBreakdown.map((category, index) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b hover:bg-muted/50"
                              >
                                <td className="p-4 font-medium">{category.category}</td>
                                <td className="p-4 text-right">₹{category.amount.toLocaleString()}</td>
                                <td className="p-4 text-right">{category.percentage.toFixed(1)}%</td>
                                <td className="p-4 text-right">
                                  <Badge
                                    variant={
                                      category.percentage > 25
                                        ? "destructive"
                                        : category.percentage > 15
                                          ? "outline"
                                          : "secondary"
                                    }
                                  >
                                    {category.percentage > 25 ? "High" : category.percentage > 15 ? "Medium" : "Normal"}
                                  </Badge>
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-8 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Info className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                  <h3 className="text-lg font-medium">No spending data found</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Add expenses to see your spending breakdown
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Budget vs Actual Tab */}
            <TabsContent value="budget" className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-[500px] w-full" />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget vs Actual Spending</CardTitle>
                      <CardDescription>Compare your planned budget with actual spending</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {aiData?.budgetSuggestions && aiData.budgetSuggestions.length > 0 ? (
                        <div className="space-y-6">
                          {aiData.budgetSuggestions.map((category, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="space-y-2"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">{category.category}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    Budget: ₹{category.suggestedBudget.toLocaleString()}
                                  </span>
                                  <span className="text-sm">Actual: ₹{category.currentSpending.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`absolute inset-y-0 left-0 ${
                                    category.currentSpending > category.suggestedBudget ? "bg-red-500" : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(100, (category.currentSpending / category.suggestedBudget) * 100)}%`,
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>
                                  {Math.round((category.currentSpending / category.suggestedBudget) * 100)}% of budget
                                </span>
                                <span
                                  className={
                                    category.currentSpending > category.suggestedBudget
                                      ? "text-red-500"
                                      : "text-green-500"
                                  }
                                >
                                  {category.currentSpending > category.suggestedBudget
                                    ? `₹${(category.currentSpending - category.suggestedBudget).toLocaleString()} over budget`
                                    : `₹${(category.suggestedBudget - category.currentSpending).toLocaleString()} under budget`}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Info className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">No budget data available</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add more financial data to see AI-powered budget suggestions
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Budget Recommendations */}
              {!isLoading && aiData?.recommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Budget Recommendations
                      </CardTitle>
                      <CardDescription>AI-powered suggestions to optimize your budget</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {aiData.recommendations.length > 0 ? (
                        <div className="space-y-4">
                          {aiData.recommendations.map((recommendation, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-1 self-stretch rounded-full ${
                                    recommendation.priority === "high"
                                      ? "bg-red-500"
                                      : recommendation.priority === "medium"
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                ></div>
                                <div>
                                  <h4 className="font-medium">{recommendation.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
                                  {recommendation.action && (
                                    <p className="text-sm font-medium mt-2">Action: {recommendation.action}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="h-12 w-12 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center mb-4">
                            <Lightbulb className="h-6 w-6 text-yellow-500" />
                          </div>
                          <h3 className="text-lg font-medium">No recommendations yet</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add more financial data to get personalized recommendations
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Trends & Insights Tab */}
            <TabsContent value="trends" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Spending Trend Chart */}
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Spending Trends</CardTitle>
                        <CardDescription>Your spending pattern over time</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="rounded-lg overflow-hidden">
                          {aiData?.charts?.lineChart ? (
                            <img
                              src={`data:image/png;base64,${aiData.charts.lineChart}`}
                              alt="Spending Trend Chart"
                              className="w-full h-auto object-contain"
                              style={{ minHeight: "300px" }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] bg-muted/50">
                              <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No trend data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Monthly Comparison Chart */}
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full"
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Monthly Comparison</CardTitle>
                        <CardDescription>Compare spending across categories</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="rounded-lg overflow-hidden">
                          {aiData?.charts?.barChart ? (
                            <img
                              src={`data:image/png;base64,${aiData.charts.barChart}`}
                              alt="Monthly Comparison Chart"
                              className="w-full h-auto object-contain"
                              style={{ minHeight: "300px" }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] bg-muted/50">
                              <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No comparison data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* AI Insights */}
              {!isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        AI-Powered Insights
                      </CardTitle>
                      <CardDescription>Personalized analysis of your financial behavior</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {aiData?.insights && aiData.insights.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {aiData.insights.map((insight, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-4 rounded-lg border ${
                                insight.type === "warning"
                                  ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                                  : insight.type === "positive"
                                    ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                                    : "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {insight.type === "warning" ? (
                                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                ) : insight.type === "positive" ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                ) : (
                                  <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                                )}
                                <div>
                                  <h4 className="font-medium">{insight.title}</h4>
                                  <p className="text-sm mt-1">{insight.description}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Info className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">No insights available</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add more financial data to receive personalized AI insights
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Savings Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Savings Goals - Derived from AI data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Savings Goals
                    </CardTitle>
                    <CardDescription>Track progress towards your financial goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : aiData?.recommendations ? (
                      <div className="space-y-6">
                        {/* Create savings goals based on recommendations */}
                        {aiData.recommendations
                          .filter(
                            (rec) =>
                              rec.title.toLowerCase().includes("emergency") ||
                              rec.title.toLowerCase().includes("fund") ||
                              rec.title.toLowerCase().includes("save") ||
                              rec.title.toLowerCase().includes("goal"),
                          )
                          .slice(0, 3)
                          .map((goal, index) => {
                            // Create mock goal progress
                            const target = 50000 * (index + 2)
                            const current = target * (Math.random() * 0.6 + 0.1)
                            const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-2"
                              >
                                <div className="flex justify-between">
                                  <h4 className="font-medium">{goal.title}</h4>
                                  <div className="text-sm">
                                    <span className="font-semibold">₹{Math.round(current).toLocaleString()}</span>
                                    <span className="text-muted-foreground"> / ₹{target.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (current / target) * 100)}%` }}
                                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                    className="absolute inset-y-0 left-0"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{Math.round((current / target) * 100)}% complete</span>
                                  <span>₹{Math.round(target - current).toLocaleString()} to go</span>
                                </div>
                              </motion.div>
                            )
                          })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Target className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No savings goals yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Set up your first savings goal to track your progress
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Add New Goal</Button>
                  </CardFooter>
                </Card>

                {/* Savings Forecast from AI model */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Savings Forecast
                    </CardTitle>
                    <CardDescription>Projected savings for the next 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array(6)
                          .fill(0)
                          .map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                      </div>
                    ) : aiData?.savingsProjection && aiData.savingsProjection.length > 0 ? (
                      <div className="space-y-4">
                        {aiData.savingsProjection.map((projection, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">{projection.month}</h4>
                                <p className="text-xs text-muted-foreground">Projected savings</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{projection.projected.toLocaleString()}</p>
                              {projection.actual > 0 && (
                                <Badge variant="outline" className="mt-1">
                                  Actual: ₹{projection.actual.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <TrendingUp className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No forecast data available</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add more financial data to receive savings projections
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Actionable Suggestions */}
              {!isLoading && aiData?.recommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Actionable Suggestions
                      </CardTitle>
                      <CardDescription>Smart tips to improve your financial health</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {aiData.recommendations.slice(0, 4).map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                                {index === 0 ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : index === 1 ? (
                                  <TrendingDown className="h-4 w-4" />
                                ) : index === 2 ? (
                                  <Bell className="h-4 w-4" />
                                ) : (
                                  <Target className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{suggestion.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                                {suggestion.action && (
                                  <p className="text-sm font-medium mt-2 text-primary">{suggestion.action}</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AuthenticatedLayout>
  )
}
