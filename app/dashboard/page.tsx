"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { BarChart, DollarSign, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/loading-skeleton"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: "up" | "down"
  trendValue?: string
  isLoading?: boolean
}

function StatCard({ title, value, description, icon, trend, trendValue, isLoading }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-4 w-32" />
            {trend && trendValue && <Skeleton className="h-4 w-20 mt-2" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
            {trend && trendValue && (
              <div className="flex items-center mt-2">
                <span className={`text-xs ${trend === "up" ? "text-green-500" : "text-red-500"} flex items-center`}>
                  {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {trendValue}
                </span>
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  interface Transaction {
    id: string
    [key: string]: any
  }

  const [dashboardData, setDashboardData] = useState<{
    balance: number
    income: number
    expenses: number
    savingsRate: number
    recentTransactions: Transaction[]
  }>({
    balance: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0,
    recentTransactions: [],
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good morning")
    } else if (hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Get current month date range
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // Fetch expenses for current month
        const expensesQuery = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid),
          where("date", ">=", startOfMonth.toISOString()),
          where("date", "<=", endOfMonth.toISOString()),
        )
        const expensesSnapshot = await getDocs(expensesQuery)

        let totalExpenses = 0
        expensesSnapshot.forEach((doc) => {
          totalExpenses += doc.data().amount
        })

        // Fetch income for current month
        const incomeQuery = query(
          collection(db, "income"),
          where("userId", "==", user.uid),
          where("date", ">=", startOfMonth.toISOString()),
          where("date", "<=", endOfMonth.toISOString()),
        )
        const incomeSnapshot = await getDocs(incomeQuery)

        let totalIncome = 0
        incomeSnapshot.forEach((doc) => {
          totalIncome += doc.data().amount
        })

        // Fetch recent transactions
        const recentTransactionsQuery = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(4),
        )
        const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery)

        const recentTransactions: { id: string; [key: string]: any }[] = []
        recentTransactionsSnapshot.forEach((doc) => {
          recentTransactions.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        // Calculate savings rate
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

        setDashboardData({
          balance: totalIncome - totalExpenses,
          income: totalIncome,
          expenses: totalExpenses,
          savingsRate,
          recentTransactions,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        // Simulate loading for demo purposes
        setTimeout(() => {
          setIsLoading(false)
        }, 1500)
      }
    }

    fetchDashboardData()
  }, [user])

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {greeting}, {user?.displayName?.split(" ")[0] || "User"}! Here's an overview of your finances.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Balance"
            value={`₹${isLoading ? "0" : dashboardData.balance.toLocaleString()}`}
            description="Your total balance across all accounts"
            icon={<DollarSign size={18} />}
            trend="up"
            trendValue="12%"
            isLoading={isLoading}
          />
          <StatCard
            title="Monthly Income"
            value={`₹${isLoading ? "0" : dashboardData.income.toLocaleString()}`}
            description="Your income this month"
            icon={<TrendingUp size={18} />}
            trend="up"
            trendValue="5%"
            isLoading={isLoading}
          />
          <StatCard
            title="Monthly Expenses"
            value={`₹${isLoading ? "0" : dashboardData.expenses.toLocaleString()}`}
            description="Your expenses this month"
            icon={<TrendingDown size={18} />}
            trend="down"
            trendValue="3%"
            isLoading={isLoading}
          />
          <StatCard
            title="Savings Rate"
            value={`${isLoading ? "0" : dashboardData.savingsRate.toFixed(1)}%`}
            description="Percentage of income saved"
            icon={<BarChart size={18} />}
            trend="up"
            trendValue="2%"
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Your spending by category</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="h-[300px] space-y-4">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center space-y-2">
                    <BarChart className="h-10 w-10 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Chart visualization will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentTransactions.length > 0 ? (
                    dashboardData.recentTransactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <DollarSign size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{transaction.description || "Expense"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">-₹{transaction.amount.toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No recent transactions</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

