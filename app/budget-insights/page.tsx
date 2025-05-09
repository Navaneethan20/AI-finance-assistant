"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getAIAnalysis, type ProcessedAIData } from "@/lib/ai-model-integration"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  Clock,
  Filter,
  LineChart,
  PieChart,
  RefreshCw,
  Wallet,
  Lightbulb,
  CreditCard,
  Landmark,
  Info,
  DollarSign,
  Percent,
  Target,
  TrendingUp,
  Sparkles,
  PiggyBank,
  Plus,
  Check,
  AlertTriangle,
  Trash2,
} from "lucide-react"
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { UnifiedLoader } from "@/components/ui/unified-loader"

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

// Interface for savings goals
interface SavingsGoal {
  id?: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  createdAt: string
  updatedAt: string
}

export default function BudgetInsights() {
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [aiData, setAiData] = useState<ProcessedAIData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastTransactionTime, setLastTransactionTime] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [isLoadingGoals, setIsLoadingGoals] = useState(true)
  const [newGoal, setNewGoal] = useState<Partial<SavingsGoal>>({
    name: "",
    targetAmount: 10000,
    currentAmount: 0,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    category: "General",
  })
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false)
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

  // Fetch savings goals
  useEffect(() => {
    if (!user) return

    setIsLoadingGoals(true)

    const goalsQuery = query(
      collection(db, "savingsGoals"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(
      goalsQuery,
      (snapshot) => {
        const goals: SavingsGoal[] = []
        snapshot.forEach((doc) => {
          goals.push({ id: doc.id, ...doc.data() } as SavingsGoal)
        })
        setSavingsGoals(goals)
        setIsLoadingGoals(false)
      },
      (error) => {
        console.error("Error fetching savings goals:", error)
        setIsLoadingGoals(false)
      },
    )

    return () => unsubscribe()
  }, [user])

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

  // Handle adding a new savings goal
  const handleAddGoal = async () => {
    if (!user) return

    if (!newGoal.name || !newGoal.targetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmittingGoal(true)

      const goalData: SavingsGoal = {
        userId: user.uid,
        name: newGoal.name || "",
        targetAmount: newGoal.targetAmount || 0,
        currentAmount: newGoal.currentAmount || 0,
        deadline: newGoal.deadline || new Date().toISOString().split("T")[0],
        category: newGoal.category || "General",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addDoc(collection(db, "savingsGoals"), goalData)

      toast({
        title: "Success",
        description: "Savings goal added successfully",
      })

      // Reset form
      setNewGoal({
        name: "",
        targetAmount: 10000,
        currentAmount: 0,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "General",
      })
      setIsAddingGoal(false)
    } catch (error) {
      console.error("Error adding savings goal:", error)
      toast({
        title: "Error",
        description: "Failed to add savings goal",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingGoal(false)
    }
  }

  // Handle updating a savings goal
  const handleUpdateGoal = async (goalId: string, amount: number) => {
    if (!user) return

    try {
      await updateDoc(doc(db, "savingsGoals", goalId), {
        currentAmount: amount,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Success",
        description: "Savings goal updated successfully",
      })
    } catch (error) {
      console.error("Error updating savings goal:", error)
      toast({
        title: "Error",
        description: "Failed to update savings goal",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a savings goal
  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, "savingsGoals", goalId))

      toast({
        title: "Success",
        description: "Savings goal deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting savings goal:", error)
      toast({
        title: "Error",
        description: "Failed to delete savings goal",
        variant: "destructive",
      })
    }
  }

  // Calculate total savings goal progress
  const totalSavingsProgress = useMemo(() => {
    if (savingsGoals.length === 0) return 0

    const totalCurrent = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)

    return totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
  }, [savingsGoals])

  // Loading state component - centered
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16 w-full">
      <UnifiedLoader size="xl" text="Analyzing your financial data..." />
      <div className="text-center max-w-md mt-8">
        <h3 className="text-lg font-medium mb-2">Crunching the numbers</h3>
        <p className="text-sm text-muted-foreground">
          Our AI is analyzing your financial patterns and preparing personalized insights.
        </p>
      </div>
    </div>
  )

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
                  <UnifiedLoader size="sm" className="mr-1" />
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
                    <div className="md:col-span-3 flex justify-center">{renderLoadingState()}</div>
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
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("spending")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "spending"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Spending Breakdown
              </button>
              <button
                onClick={() => setActiveTab("budget")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "budget"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Budget vs Actual
              </button>
              <button
                onClick={() => setActiveTab("trends")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "trends"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Trends & Insights
              </button>
              <button
                onClick={() => setActiveTab("goals")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "goals"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Savings Goals
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* AI Model Charts - INCREASED SIZE */}
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-center justify-center h-[450px] bg-card rounded-lg border shadow-sm">
                      <UnifiedLoader size="lg" text="Loading expense distribution..." />
                    </div>
                    <div className="flex items-center justify-center h-[450px] bg-card rounded-lg border shadow-sm">
                      <UnifiedLoader size="lg" text="Loading income vs expenses chart..." />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                      <div className="p-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Expense Distribution</h3>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <PieChart className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="p-0 flex items-center justify-center">
                        {aiData?.charts?.pieChart ? (
                          <img
                            src={`data:image/png;base64,${aiData.charts.pieChart}`}
                            alt="Expense Distribution Chart"
                            className="w-full h-auto object-contain mx-auto"
                            style={{ minHeight: "350px", maxHeight: "450px" }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[350px] w-full">
                            <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No chart data available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                      <div className="p-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Income vs Expenses</h3>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <LineChart className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="p-0 flex items-center justify-center">
                        {aiData?.charts?.lineChart ? (
                          <img
                            src={`data:image/png;base64,${aiData.charts.lineChart}`}
                            alt="Income vs Expenses Chart"
                            className="w-full h-auto object-contain mx-auto"
                            style={{ minHeight: "350px", maxHeight: "450px" }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[350px] w-full">
                            <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No chart data available</p>
                          </div>
                        )}
                      </div>
                    </div>
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
                      <div className="flex justify-center py-8">
                        <UnifiedLoader size="lg" text="Loading top categories..." />
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

              {/* Upcoming Bills - Dynamically generated based on categories */}
              
            </div>
          )}

          {/* Spending Breakdown Tab */}
          {activeTab === "spending" && (
            <div className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Category Breakdown Chart - INCREASED SIZE */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-[550px] bg-card rounded-lg border shadow-sm">
                    <UnifiedLoader size="lg" text="Loading category breakdown..." />
                  </div>
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
                              style={{ minHeight: "450px" }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[450px] bg-muted/50">
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
                    <div className="max-h-[550px] overflow-y-auto">
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

              {/* Monthly Spending Trends - INCREASED SIZE */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trends</CardTitle>
                  <CardDescription>How your spending has changed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <UnifiedLoader size="lg" text="Loading spending trends..." />
                    </div>
                  ) : aiData?.charts?.barChart ? (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={`data:image/png;base64,${aiData.charts.barChart}`}
                        alt="Monthly Spending Trends"
                        className="w-full h-auto object-contain mx-auto"
                        style={{ maxHeight: "450px" }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[350px] bg-muted/50 rounded-lg">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No trend data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Spending Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Spending Categories</CardTitle>
                  <CardDescription>Categories where you spend the most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {isLoading
                      ? Array(4)
                          .fill(0)
                          .map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                      : getTopCategories().map((category, index) => (
                          <Card key={index} className="bg-muted/30">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                  {index === 0 ? (
                                    <DollarSign className="h-5 w-5" />
                                  ) : index === 1 ? (
                                    <CreditCard className="h-5 w-5" />
                                  ) : index === 2 ? (
                                    <Wallet className="h-5 w-5" />
                                  ) : (
                                    <Percent className="h-5 w-5" />
                                  )}
                                </div>
                                <Badge variant={category.isOverspent ? "destructive" : "outline"} className="text-xs">
                                  {category.percentage.toFixed(1)}%
                                </Badge>
                              </div>
                              <h3 className="font-medium">{category.category}</h3>
                              <p className="text-2xl font-bold mt-1">₹{category.amount.toLocaleString()}</p>
                            </CardContent>
                          </Card>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Budget vs Actual Tab */}
          {activeTab === "budget" && (
            <div className="space-y-6 mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-[500px] bg-card rounded-lg border shadow-sm">
                  <UnifiedLoader size="lg" text="Loading budget data..." />
                </div>
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
                                    width: `${Math.min(
                                      100,
                                      (category.currentSpending / category.suggestedBudget) * 100,
                                    )}%`,
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
                                    ? `₹${(
                                        category.currentSpending - category.suggestedBudget
                                      ).toLocaleString()} over budget`
                                    : `₹${(
                                        category.suggestedBudget - category.currentSpending
                                      ).toLocaleString()} under budget`}
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

              {/* Budget Overview */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Budget Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Summary</CardTitle>
                    <CardDescription>Overall budget performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Budget</span>
                            <span className="font-medium">
                              ₹
                              {aiData?.budgetSuggestions
                                ? aiData.budgetSuggestions
                                    .reduce((sum, item) => sum + item.suggestedBudget, 0)
                                    .toLocaleString()
                                : "0"}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total Spent</span>
                              <span className="font-medium">₹{financialMetrics.totalExpenses.toLocaleString()}</span>
                            </div>
                            <Progress
                              value={
                                aiData?.budgetSuggestions && aiData.budgetSuggestions.length > 0
                                  ? Math.min(
                                      100,
                                      (financialMetrics.totalExpenses /
                                        aiData.budgetSuggestions.reduce((sum, item) => sum + item.suggestedBudget, 0)) *
                                        100,
                                    )
                                  : 0
                              }
                              className="h-2"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Budget Health</span>
                            <Badge
                              variant={
                                financialMetrics.budgetHealth === "good"
                                  ? "outline"
                                  : financialMetrics.budgetHealth === "warning"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {financialMetrics.budgetHealth === "good"
                                ? "Good"
                                : financialMetrics.budgetHealth === "warning"
                                  ? "Warning"
                                  : "Critical"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {financialMetrics.budgetHealth === "good"
                              ? "You're staying within your budget and saving well."
                              : financialMetrics.budgetHealth === "warning"
                                ? "You're close to exceeding your budget in some categories."
                                : "You've exceeded your budget in multiple categories."}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Budget Recommendations */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Budget Recommendations
                    </CardTitle>
                    <CardDescription>AI-powered suggestions to optimize your budget</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-20 w-full bg-white/50 dark:bg-gray-800/50" />
                        <Skeleton className="h-20 w-full bg-white/50 dark:bg-gray-800/50" />
                      </div>
                    ) : aiData?.recommendations && aiData.recommendations.length > 0 ? (
                      <div className="space-y-4">
                        {aiData.recommendations
                          .filter((rec) => rec.title.toLowerCase().includes("budget") || rec.type === "warning")
                          .slice(0, 3)
                          .map((recommendation, index) => (
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
                  <CardFooter>
                    <Button variant="outline" className="w-full bg-white/80 dark:bg-gray-800/80">
                      Create Custom Budget
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {/* Trends & Insights Tab - NEW IMPLEMENTATION */}
          {activeTab === "trends" && (
            <div className="space-y-6 mt-6">
              {/* Monthly Spending Trends Chart - INCREASED SIZE */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Monthly Spending Trends
                  </CardTitle>
                  <CardDescription>How your spending has changed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <UnifiedLoader size="lg" text="Loading spending trends..." />
                    </div>
                  ) : aiData?.charts?.lineChart ? (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={`data:image/png;base64,${aiData.charts.lineChart}`}
                        alt="Monthly Spending Trends"
                        className="w-full h-auto object-contain mx-auto"
                        style={{ minHeight: "400px", maxHeight: "500px" }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] bg-muted/50 rounded-lg">
                      <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No trend data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    AI-Powered Insights
                  </CardTitle>
                  <CardDescription>Personalized financial insights based on your data</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full bg-white/50 dark:bg-gray-800/50" />
                      <Skeleton className="h-24 w-full bg-white/50 dark:bg-gray-800/50" />
                    </div>
                  ) : aiData?.insights && aiData.insights.length > 0 ? (
                    <div className="space-y-4">
                      {aiData.insights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                insight.type === "positive"
                                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                  : insight.type === "warning"
                                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                                    : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                              }`}
                            >
                              {insight.type === "positive" ? (
                                <Check className="h-5 w-5" />
                              ) : insight.type === "warning" ? (
                                <AlertTriangle className="h-5 w-5" />
                              ) : (
                                <Info className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-12 w-12 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-medium">No insights available yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add more financial data to get personalized insights
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Spending Patterns */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Category Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category Trends</CardTitle>
                    <CardDescription>How your spending in each category has changed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : aiData?.spendingTrends && aiData.spendingTrends.length > 0 ? (
                      <div className="space-y-6">
                        {getTopCategories()
                          .slice(0, 3)
                          .map((category, index) => {
                            // Calculate a random trend percentage for demonstration
                            const trendPercentage = Math.random() * 20 - 10 // Between -10% and +10%
                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium">{category.category}</h4>
                                  <div className="flex items-center gap-1">
                                    {trendPercentage > 0 ? (
                                      <ArrowUp className="h-3 w-3 text-red-500" />
                                    ) : (
                                      <ArrowDown className="h-3 w-3 text-green-500" />
                                    )}
                                    <span className={trendPercentage > 0 ? "text-red-500" : "text-green-500"}>
                                      {Math.abs(trendPercentage).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                                <Progress
                                  value={50 + trendPercentage * 2} // Center at 50% with variation
                                  className="h-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Previous {timeRange}</span>
                                  <span>Current {timeRange}</span>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <TrendingUp className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No trend data available</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add more transactions to see category trends
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actionable Recommendations</CardTitle>
                    <CardDescription>Steps you can take to improve your finances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : aiData?.recommendations && aiData.recommendations.length > 0 ? (
                      <div className="space-y-4">
                        {aiData.recommendations.slice(0, 3).map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                recommendation.priority === "high"
                                  ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                                  : recommendation.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                                    : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{recommendation.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Lightbulb className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No recommendations yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add more financial data to get personalized recommendations
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Savings Projection */}
              <Card>
                <CardHeader>
                  <CardTitle>Savings Projection</CardTitle>
                  <CardDescription>Projected vs actual savings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <UnifiedLoader size="lg" text="Loading savings projection..." />
                    </div>
                  ) : aiData?.savingsProjection && aiData.savingsProjection.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {aiData.savingsProjection.map((projection, index) => (
                          <div key={index} className="bg-muted/30 p-4 rounded-lg text-center">
                            <p className="text-sm font-medium">{projection.month}</p>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Projected:</span>
                                <span>₹{projection.projected.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Actual:</span>
                                <span className={projection.actual > 0 ? "text-green-500" : "text-muted-foreground"}>
                                  {projection.actual > 0 ? `₹${projection.actual.toLocaleString()}` : "Pending"}
                                </span>
                              </div>
                            </div>
                            {projection.actual > 0 && (
                              <div className="mt-2">
                                <Progress value={(projection.actual / projection.projected) * 100} className="h-1" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <LineChart className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No projection data available</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add more financial data to see savings projections
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Savings Goals Tab - NEW IMPLEMENTATION */}
          {activeTab === "goals" && (
            <div className="space-y-6 mt-6">
              {/* Overall Savings Progress */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Savings Goals Progress
                  </CardTitle>
                  <CardDescription>Track your progress towards financial goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Overall Progress</span>
                        <span className="text-sm font-medium">{totalSavingsProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={totalSavingsProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {totalSavingsProgress < 25
                          ? "Just getting started! Keep adding to your savings."
                          : totalSavingsProgress < 50
                            ? "You're making progress! Keep going."
                            : totalSavingsProgress < 75
                              ? "You're well on your way to reaching your goals!"
                              : "Almost there! You're doing great."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          ₹{savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                        </h3>
                        <p className="text-sm text-muted-foreground">Current Savings</p>
                      </div>
                      <div className="h-8 border-r border-gray-200 dark:border-gray-700"></div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          ₹{savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}
                        </h3>
                        <p className="text-sm text-muted-foreground">Target Amount</p>
                      </div>
                      <div className="h-8 border-r border-gray-200 dark:border-gray-700"></div>
                      <div>
                        <h3 className="text-lg font-semibold">{savingsGoals.length}</h3>
                        <p className="text-sm text-muted-foreground">Active Goals</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add New Goal Button */}
              {!isAddingGoal && (
                <div className="flex justify-end">
                  <Button onClick={() => setIsAddingGoal(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add New Goal</span>
                  </Button>
                </div>
              )}

              {/* Add New Goal Form */}
              {isAddingGoal && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Savings Goal</CardTitle>
                    <CardDescription>Set a new financial target to work towards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal-name">Goal Name</Label>
                        <Input
                          id="goal-name"
                          placeholder="e.g., Emergency Fund, Vacation, New Car"
                          value={newGoal.name}
                          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-category">Category</Label>
                        <Input
                          id="goal-category"
                          placeholder="e.g., Emergency, Travel, Vehicle"
                          value={newGoal.category}
                          onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-target">Target Amount (₹)</Label>
                        <Input
                          id="goal-target"
                          type="number"
                          placeholder="50000"
                          value={newGoal.targetAmount}
                          onChange={(e) =>
                            setNewGoal({ ...newGoal, targetAmount: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-current">Current Amount (₹)</Label>
                        <Input
                          id="goal-current"
                          type="number"
                          placeholder="0"
                          value={newGoal.currentAmount}
                          onChange={(e) =>
                            setNewGoal({ ...newGoal, currentAmount: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-deadline">Target Date</Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGoal} disabled={isSubmittingGoal}>
                      {isSubmittingGoal ? (
                        <>
                          <UnifiedLoader size="sm" className="mr-2" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <span>Create Goal</span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Savings Goals List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Savings Goals</h3>

                {isLoadingGoals ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : savingsGoals.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {savingsGoals.map((goal) => (
                      <Card key={goal.id} className="overflow-hidden">
                        <div
                          className="h-2 bg-primary"
                          style={{
                            width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%`,
                          }}
                        ></div>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{goal.name}</CardTitle>
                              <CardDescription>{goal.category}</CardDescription>
                            </div>
                            <Badge variant="outline">
                              {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Current</span>
                              <span className="font-medium">₹{goal.currentAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Target</span>
                              <span className="font-medium">₹{goal.targetAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Deadline</span>
                              <span className="font-medium">{formatDate(goal.deadline)}</span>
                            </div>

                            <div className="pt-2">
                              <Label htmlFor={`goal-slider-${goal.id}`} className="text-xs text-muted-foreground">
                                Update Progress
                              </Label>
                              <div className="flex items-center gap-4 mt-1">
                                <Slider
                                  id={`goal-slider-${goal.id}`}
                                  defaultValue={[(goal.currentAmount / goal.targetAmount) * 100]}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => {
                                    const newAmount = Math.round((value[0] / 100) * goal.targetAmount)
                                    if (goal.id) {
                                      handleUpdateGoal(goal.id, newAmount)
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    if (goal.id) {
                                      handleDeleteGoal(goal.id)
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <PiggyBank className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No savings goals yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Create your first savings goal to start tracking your progress towards financial freedom
                    </p>
                    <Button className="mt-4" onClick={() => setIsAddingGoal(true)}>
                      Create Your First Goal
                    </Button>
                  </div>
                )}
              </div>

              {/* Savings Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Savings Tips
                  </CardTitle>
                  <CardDescription>Smart ways to reach your goals faster</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">Automate Your Savings</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Set up automatic transfers to your savings account on payday to ensure consistent progress.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">Follow the 50/30/20 Rule</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">Cut Unnecessary Expenses</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Review your spending to identify and eliminate non-essential expenses that drain your budget.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AuthenticatedLayout>
  )
}
