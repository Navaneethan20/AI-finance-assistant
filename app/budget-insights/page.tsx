"use client"

import type React from "react"

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
  Target,
  TrendingUp,
  PiggyBank,
  Plus,
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
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { UnifiedLoader } from "@/components/ui/unified-loader"
import dynamic from "next/dynamic"

// Dynamically import chart components for better performance
const DynamicPieChart = dynamic(() => import("@/components/charts/budget-donut-chart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <UnifiedLoader size="lg" text="Loading chart..." />
    </div>
  ),
})

const DynamicLineChart = dynamic(() => import("@/components/charts/spending-line-chart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <UnifiedLoader size="lg" text="Loading chart..." />
    </div>
  ),
})

const DynamicBarChart = dynamic(() => import("@/components/charts/savings-bar-chart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <UnifiedLoader size="lg" text="Loading chart..." />
    </div>
  ),
})

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

// Transaction interfaces
interface Transaction {
  id?: string
  userId: string
  date: string
  description: string
  amount: number
  category: string
  createdAt?: Timestamp
}

interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
}

interface MonthlyData {
  month: string
  income: number
  expenses: number
  savings: number
}

// Chart color palette
const CHART_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#8b5cf6",
  "#d946ef",
  "#f43f5e",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#ec4899",
  "#0ea5e9",
]

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
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Raw transaction data
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [income, setIncome] = useState<Transaction[]>([])
  const [hasTransactions, setHasTransactions] = useState(false)

  // Derived chart data
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

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

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

  // Fetch raw transaction data
  const fetchTransactions = useCallback(async () => {
    if (!user) return

    try {
      // Get date range based on selected time range
      const now = new Date()
      let startDate = new Date(),
        endDate = new Date()

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

      // Fetch expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        where("date", ">=", startDate.toISOString()),
        where("date", "<=", endDate.toISOString()),
        orderBy("date", "asc"),
      )

      const expensesSnapshot = await getDocs(expensesQuery)
      const expensesData: Transaction[] = []

      expensesSnapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() } as Transaction)
      })

      setExpenses(expensesData)

      // Fetch income
      const incomeQuery = query(
        collection(db, "income"),
        where("userId", "==", user.uid),
        where("date", ">=", startDate.toISOString()),
        where("date", "<=", endDate.toISOString()),
        orderBy("date", "asc"),
      )

      const incomeSnapshot = await getDocs(incomeQuery)
      const incomeData: Transaction[] = []

      incomeSnapshot.forEach((doc) => {
        incomeData.push({ id: doc.id, ...doc.data() } as Transaction)
      })

      setIncome(incomeData)

      // Check if user has any transactions
      setHasTransactions(expensesData.length > 0 || incomeData.length > 0)

      return {
        expenses: expensesData,
        income: incomeData,
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return null
    }
  }, [user, timeRange])

  // Process transaction data into chart-ready formats
  const processTransactionData = useCallback((expenses: Transaction[], income: Transaction[]) => {
    // Process category data for pie chart
    const categoryMap = new Map<string, number>()

    expenses.forEach((expense) => {
      const amount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, amount + expense.amount)
    })

    const totalExpenses = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0)

    // Only include categories with data
    const categories: CategoryData[] = Array.from(categoryMap.entries())
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))

    setCategoryData(categories)

    // Process monthly data for line/bar chart
    const monthlyMap = new Map<string, { income: number; expenses: number }>()

    // Function to get month key
    const getMonthKey = (dateStr: string) => {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${date.getMonth() + 1}`
    }

    // Process expenses by month
    expenses.forEach((expense) => {
      const monthKey = getMonthKey(expense.date)
      const monthData = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
      monthlyMap.set(monthKey, {
        ...monthData,
        expenses: monthData.expenses + expense.amount,
      })
    })

    // Process income by month
    income.forEach((inc) => {
      const monthKey = getMonthKey(inc.date)
      const monthData = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
      monthlyMap.set(monthKey, {
        ...monthData,
        income: monthData.income + inc.amount,
      })
    })

    // Convert to array and sort by month
    const monthlyDataArray = Array.from(monthlyMap.entries())
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-")
        return {
          month: new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          income: data.income,
          expenses: data.expenses,
          savings: data.income - data.expenses,
        }
      })
      .sort((a, b) => {
        // Sort by date (assuming month is in format "Jan 2024")
        const dateA = new Date(a.month)
        const dateB = new Date(b.month)
        return dateA.getTime() - dateB.getTime()
      })

    setMonthlyData(monthlyDataArray)

    return {
      categories,
      monthlyData: monthlyDataArray,
    }
  }, [])

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

  // No data placeholder component
  const NoDataPlaceholder = ({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-muted flex items-center justify-center mb-3 md:mb-4">
        {icon}
      </div>
      <h3 className="text-base md:text-lg font-medium">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-md">{message}</p>
    </div>
  )

  // Loading state component - centered
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-8 w-full">
      <UnifiedLoader size={isMobile ? "md" : "xl"} text="Analyzing your financial data..." />
      <div className="text-center max-w-md mt-4">
        <h3 className="text-base md:text-lg font-medium mb-2">Crunching the numbers</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Our AI is analyzing your financial patterns and preparing personalized insights.
        </p>
      </div>
    </div>
  )

  return (
    <AuthenticatedLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4 md:space-y-6">
        {/* Header with filters */}
        <motion.div variants={slideUp} className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Budget Insights</h1>
            <p className="text-xs md:text-base text-muted-foreground mt-1">
              AI-powered analysis of your financial data
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-1 text-xs h-8"
            >
              {isRefreshing ? (
                <>
                  <UnifiedLoader size="sm" className="mr-1" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Refresh</span>
                </>
              )}
            </Button>

            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={timeRange === "month" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange("month")}
                className="text-xs px-2 h-7"
              >
                Month
              </Button>
              <Button
                variant={timeRange === "quarter" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange("quarter")}
                className="text-xs px-2 h-7"
              >
                Quarter
              </Button>
              <Button
                variant={timeRange === "year" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange("year")}
                className="text-xs px-2 h-7"
              >
                Year
              </Button>
            </div>

            <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs h-8">
              <Filter className="h-3 w-3 md:h-4 md:w-4" />
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
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-xl">Financial Summary</CardTitle>
                <div className="flex items-center gap-1 md:gap-2">
                  <div
                    className={`h-2 w-2 md:h-3 md:w-3 rounded-full ${getBudgetHealthColor(financialMetrics.budgetHealth)}`}
                  ></div>
                  <span className="text-xs md:text-sm font-medium capitalize">{financialMetrics.budgetHealth}</span>
                </div>
              </div>
              <CardDescription className="text-xs md:text-sm">
                {timeRange === "month" ? "Current month" : timeRange === "quarter" ? "Current quarter" : "Current year"}{" "}
                overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                  {isLoading ? (
                    <div className="col-span-full flex justify-center">{renderLoadingState()}</div>
                  ) : (
                    <>
                      {/* Mobile-friendly metrics display */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs md:text-sm text-muted-foreground">Total Income</p>
                            <h3 className="text-lg md:text-2xl font-bold mt-1">
                              ₹{financialMetrics.totalIncome.toLocaleString()}
                            </h3>
                          </div>
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs md:text-sm">
                          {getChangeIndicator(financialMetrics.monthlyChange.income)}
                          <span className="ml-1 text-muted-foreground">vs last {timeRange}</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs md:text-sm text-muted-foreground">Total Expenses</p>
                            <h3 className="text-lg md:text-2xl font-bold mt-1">
                              ₹{financialMetrics.totalExpenses.toLocaleString()}
                            </h3>
                          </div>
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
                            <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs md:text-sm">
                          {getChangeIndicator(financialMetrics.monthlyChange.expenses)}
                          <span className="ml-1 text-muted-foreground">vs last {timeRange}</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs md:text-sm text-muted-foreground">Total Savings</p>
                            <h3 className="text-lg md:text-2xl font-bold mt-1">
                              ₹{financialMetrics.savingsAmount.toLocaleString()}
                            </h3>
                          </div>
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Landmark className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs md:text-sm">
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

        {/* Main Content Tabs - Scrollable on mobile */}
        <motion.div variants={slideUp}>
          <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 whitespace-nowrap">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("spending")}
                className={`py-3 px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "spending"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Spending
              </button>
              <button
                onClick={() => setActiveTab("budget")}
                className={`py-3 px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "budget"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Budget
              </button>
              <button
                onClick={() => setActiveTab("trends")}
                className={`py-3 px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "trends"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => setActiveTab("goals")}
                className={`py-3 px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "goals"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Goals
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4 mt-4">
              {/* Charts Section */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {isLoading ? (
                  <>
                    <div className="flex items-center justify-center h-[250px] bg-card rounded-lg border shadow-sm">
                      <UnifiedLoader size="md" text="Loading expense distribution..." />
                    </div>
                    <div className="flex items-center justify-center h-[250px] bg-card rounded-lg border shadow-sm">
                      <UnifiedLoader size="md" text="Loading income vs expenses chart..." />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Expense Distribution Chart */}
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                          <PieChart className="h-4 w-4 text-primary" />
                          Expense Distribution
                        </CardTitle>
                        <CardDescription className="text-xs">Breakdown of your spending by category</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 pt-0 pb-2">
                        <div className="w-full h-[250px]">
                          {aiData?.charts?.pieChart ? (
                            <img
                              src={`data:image/png;base64,${aiData.charts.pieChart}`}
                              alt="Expense Distribution Chart"
                              className="w-full h-auto object-contain mx-auto"
                              style={{ maxHeight: "250px" }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[250px] w-full">
                              <PieChart className="h-10 w-10 text-muted-foreground mb-3" />
                              <p className="text-xs text-muted-foreground">No chart data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Income vs Expenses Chart */}
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                          <LineChart className="h-4 w-4 text-primary" />
                          Income vs Expenses
                        </CardTitle>
                        <CardDescription className="text-xs">Monthly comparison of income and spending</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 pt-0 pb-2">
                        <div className="w-full h-[250px]">
                          {aiData?.charts?.lineChart ? (
                            <img
                              src={`data:image/png;base64,${aiData.charts.lineChart}`}
                              alt="Income vs Expenses Chart"
                              className="w-full h-auto object-contain mx-auto"
                              style={{ maxHeight: "250px" }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[250px] w-full">
                              <LineChart className="h-10 w-10 text-muted-foreground mb-3" />
                              <p className="text-xs text-muted-foreground">No chart data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Top Spending Categories */}
              {!isLoading && (
                <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Top Spending Categories
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Your highest expense categories this {timeRange}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getTopCategories().length > 0 ? (
                        <div className="space-y-3">
                          {getTopCategories().map((category, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <div
                                className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: category.color || "#3b82f6" }}
                              >
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <h4 className="font-medium text-sm">{category.category}</h4>
                                    {category.isOverspent && (
                                      <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                        Overspent
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="font-semibold text-sm">₹{category.amount.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full"
                                    style={{
                                      width: `${Math.min(100, category.percentage)}%`,
                                      backgroundColor: category.color || "#3b82f6",
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                                  <span>{category.percentage.toFixed(1)}% of total</span>
                                  {category.isOverspent && <span className="text-red-500">Consider reducing</span>}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Info className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <h3 className="text-sm font-medium">No expense categories</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Add some expenses to see your top spending categories
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Upcoming Bills */}
              
            </div>
          )}

          {/* Spending Breakdown Tab */}
          {activeTab === "spending" && (
            <div className="space-y-4 mt-4">
              {/* Category Breakdown Chart and Category Details */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Category Breakdown Chart */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-[300px] bg-card rounded-lg border shadow-sm">
                    <UnifiedLoader size="md" text="Loading category breakdown..." />
                  </div>
                ) : (
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base md:text-lg">Category Breakdown</CardTitle>
                      <CardDescription className="text-xs">Your spending by category</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pt-0 pb-2">
                      <div className="w-full h-[300px]">
                        {aiData?.charts?.pieChart ? (
                          <img
                            src={`data:image/png;base64,${aiData.charts.pieChart}`}
                            alt="Category Breakdown Chart"
                            className="w-full h-auto object-contain mx-auto"
                            style={{ maxHeight: "300px" }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[300px] w-full">
                            <PieChart className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-xs text-muted-foreground">No chart data available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Category Details */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg">Spending by Category</CardTitle>
                    <CardDescription className="text-xs">Detailed breakdown of your expenses</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto">
                      {isLoading ? (
                        <div className="p-4 space-y-3">
                          {Array(4)
                            .fill(0)
                            .map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                      ) : aiData?.categoryBreakdown && aiData.categoryBreakdown.length > 0 ? (
                        <div className="divide-y">
                          {aiData.categoryBreakdown.map((category, index) => (
                            <div key={index} className="p-3 flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">{category.category}</p>
                                <p className="text-xs text-muted-foreground">
                                  {category.percentage.toFixed(1)}% of total
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">₹{category.amount.toLocaleString()}</p>
                                <Badge
                                  variant={
                                    category.percentage > 25
                                      ? "destructive"
                                      : category.percentage > 15
                                        ? "outline"
                                        : "secondary"
                                  }
                                  className="text-[10px] px-1 py-0"
                                >
                                  {category.percentage > 25 ? "High" : category.percentage > 15 ? "Medium" : "Normal"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Info className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <h3 className="text-sm font-medium">No spending data found</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Add expenses to see your spending breakdown
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Spending Trends */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Monthly Spending Trends</CardTitle>
                  <CardDescription className="text-xs">How your spending has changed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <UnifiedLoader size="md" text="Loading spending trends..." />
                    </div>
                  ) : aiData?.charts?.barChart ? (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={`data:image/png;base64,${aiData.charts.barChart}`}
                        alt="Monthly Spending Trends"
                        className="w-full h-auto object-contain mx-auto"
                        style={{ maxHeight: "250px" }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] bg-muted/50 rounded-lg">
                      <BarChart3 className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-xs text-muted-foreground">No trend data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Budget vs Actual Tab */}
          {activeTab === "budget" && (
            <div className="space-y-4 mt-4">
              {/* Budget Overview */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Budget Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg">Budget Summary</CardTitle>
                    <CardDescription className="text-xs">Overall budget performance</CardDescription>
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
                      <div className="space-y-4">
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
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Budget Recommendations
                    </CardTitle>
                    <CardDescription className="text-xs">
                      AI-powered suggestions to optimize your budget
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full bg-white/50 dark:bg-gray-800/50" />
                        <Skeleton className="h-16 w-full bg-white/50 dark:bg-gray-800/50" />
                      </div>
                    ) : aiData?.recommendations && aiData.recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {aiData.recommendations
                          .filter((rec) => rec.title.toLowerCase().includes("budget") || rec.type === "warning")
                          .slice(0, 2)
                          .map((recommendation, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                            >
                              <div className="flex items-start gap-2">
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
                                  <h4 className="font-medium text-sm">{recommendation.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">{recommendation.description}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-10 w-10 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center mb-3">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                        </div>
                        <h3 className="text-sm font-medium">No recommendations yet</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add more financial data to get personalized recommendations
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full bg-white/80 dark:bg-gray-800/80 text-sm h-9">
                      Create Custom Budget
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {/* Trends & Insights Tab */}
          {activeTab === "trends" && (
            <div className="space-y-4 mt-4">
              {/* Category Trends and Recommendations */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Category Trends */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg">Category Trends</CardTitle>
                    <CardDescription className="text-xs">
                      How your spending in each category has changed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : getTopCategories().length > 0 ? (
                      <div className="space-y-4">
                        {getTopCategories()
                          .slice(0, 3)
                          .map((category, index) => {
                            // Calculate a random trend percentage for demonstration
                            const trendPercentage = Math.random() * 20 - 10 // Between -10% and +10%
                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium text-sm">{category.category}</h4>
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
                                  className="h-1.5"
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
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                          <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-medium">No trend data available</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add more transactions to see category trends
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg">Actionable Recommendations</CardTitle>
                    <CardDescription className="text-xs">Steps you can take to improve your finances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : aiData?.recommendations && aiData.recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {aiData.recommendations.slice(0, 2).map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center ${
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
                              <h4 className="font-medium text-sm">{recommendation.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{recommendation.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Lightbulb className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-medium">No recommendations yet</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add more financial data to get personalized recommendations
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Savings Goals Tab */}
          {activeTab === "goals" && (
            <div className="space-y-4 mt-4">
              {/* Overall Savings Progress */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Savings Goals Progress
                  </CardTitle>
                  <CardDescription className="text-xs">Track your progress towards financial goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Overall Progress</span>
                        <span className="text-xs font-medium">{totalSavingsProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={totalSavingsProgress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {totalSavingsProgress < 25
                          ? "Just getting started! Keep adding to your savings."
                          : totalSavingsProgress < 50
                            ? "You're making progress! Keep going."
                            : totalSavingsProgress < 75
                              ? "You're well on your way to reaching your goals!"
                              : "Almost there! You're doing great."}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <p className="text-sm font-semibold">
                          ₹{savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Current</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <p className="text-sm font-semibold">
                          ₹{savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Target</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <p className="text-sm font-semibold">{savingsGoals.length}</p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add New Goal Button */}
              {!isAddingGoal && (
                <div className="flex justify-end">
                  <Button onClick={() => setIsAddingGoal(true)} className="flex items-center gap-1 text-sm h-9">
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Add New Goal</span>
                  </Button>
                </div>
              )}

              {/* Add New Goal Form */}
              {isAddingGoal && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg">Create New Savings Goal</CardTitle>
                    <CardDescription className="text-xs">Set a new financial target to work towards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="goal-name" className="text-xs">
                          Goal Name
                        </Label>
                        <Input
                          id="goal-name"
                          placeholder="e.g., Emergency Fund, Vacation, New Car"
                          value={newGoal.name}
                          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="goal-category" className="text-xs">
                          Category
                        </Label>
                        <Input
                          id="goal-category"
                          placeholder="e.g., Emergency, Travel, Vehicle"
                          value={newGoal.category}
                          onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="goal-target" className="text-xs">
                          Target Amount (₹)
                        </Label>
                        <Input
                          id="goal-target"
                          type="number"
                          placeholder="50000"
                          value={newGoal.targetAmount}
                          onChange={(e) =>
                            setNewGoal({ ...newGoal, targetAmount: Number.parseInt(e.target.value) || 0 })
                          }
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="goal-current" className="text-xs">
                          Current Amount (₹)
                        </Label>
                        <Input
                          id="goal-current"
                          type="number"
                          placeholder="0"
                          value={newGoal.currentAmount}
                          onChange={(e) =>
                            setNewGoal({ ...newGoal, currentAmount: Number.parseInt(e.target.value) || 0 })
                          }
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="goal-deadline" className="text-xs">
                          Target Date
                        </Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsAddingGoal(false)} className="text-xs h-8">
                      Cancel
                    </Button>
                    <Button onClick={handleAddGoal} disabled={isSubmittingGoal} className="text-xs h-8">
                      {isSubmittingGoal ? (
                        <>
                          <UnifiedLoader size="sm" className="mr-1" />
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
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Your Savings Goals</h3>

                {isLoadingGoals ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : savingsGoals.length > 0 ? (
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    {savingsGoals.map((goal) => (
                      <Card key={goal.id} className="overflow-hidden">
                        <div
                          className="h-1.5 bg-primary"
                          style={{
                            width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%`,
                          }}
                        ></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{goal.name}</CardTitle>
                              <CardDescription className="text-xs">{goal.category}</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-xs text-muted-foreground">Current</p>
                                <p className="text-sm font-medium">₹{goal.currentAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Target</p>
                                <p className="text-sm font-medium">₹{goal.targetAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Deadline</p>
                                <p className="text-sm font-medium">{formatDate(goal.deadline)}</p>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor={`goal-slider-${goal.id}`} className="text-xs text-muted-foreground">
                                Update Progress
                              </Label>
                              <div className="flex items-center gap-2 mt-1">
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
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    if (goal.id) {
                                      handleDeleteGoal(goal.id)
                                    }
                                  }}
                                  className="h-7 w-7"
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <PiggyBank className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium">No savings goals yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      Create your first savings goal to start tracking your progress
                    </p>
                    <Button className="mt-3 text-xs h-8" onClick={() => setIsAddingGoal(true)}>
                      Create Your First Goal
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AuthenticatedLayout>
  )
}
