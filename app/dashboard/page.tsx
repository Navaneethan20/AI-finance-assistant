"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { QuickActionButtons } from "@/components/quick-action-buttons"
import { motion } from "framer-motion"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { ExpenseBreakdownChart } from "@/components/charts/expense-breakdown-chart"

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
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

          // Group expenses by category for the expense breakdown chart
          const categoryExpenses: Record<string, number> = {}

          expensesSnapshot.forEach((doc) => {
            const data = doc.data()
            totalExpenses += data.amount

            // Add to category expenses
            if (!categoryExpenses[data.category]) {
              categoryExpenses[data.category] = 0
            }
            categoryExpenses[data.category] += data.amount
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

          // Calculate balance and savings rate
          const balance = totalIncome - totalExpenses
          const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

          // Fetch recent transactions
          const recentTransactionsQuery = query(
            collection(db, "expenses"),
            where("userId", "==", user.uid),
            orderBy("date", "desc"),
            limit(5),
          )
          const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery)
          const recentTransactions: any[] = []
          recentTransactionsSnapshot.forEach((doc) => {
            const data = doc.data()
            recentTransactions.push({
              id: doc.id,
              description: data.description || data.category,
              amount: data.amount,
              date: format(new Date(data.date), "dd MMM yyyy"),
              type: "expense",
            })
          })

          // Fetch recent income
          const recentIncomeQuery = query(
            collection(db, "income"),
            where("userId", "==", user.uid),
            orderBy("date", "desc"),
            limit(3),
          )
          const recentIncomeSnapshot = await getDocs(recentIncomeQuery)
          recentIncomeSnapshot.forEach((doc) => {
            const data = doc.data()
            recentTransactions.push({
              id: doc.id,
              description: data.source || "Income",
              amount: data.amount,
              date: format(new Date(data.date), "dd MMM yyyy"),
              type: "income",
            })
          })

          // Sort all transactions by date
          recentTransactions.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          })

          // Create expense breakdown data for the chart
          const expenseBreakdown = Object.entries(categoryExpenses)
            .map(([category, amount]) => {
              // Generate a color based on the category name
              const colors = [
                "#3b82f6", // blue
                "#10b981", // green
                "#f59e0b", // amber
                "#ef4444", // red
                "#8b5cf6", // violet
                "#ec4899", // pink
                "#06b6d4", // cyan
                "#f97316", // orange
              ]
              const colorIndex =
                Math.abs(category.charCodeAt(0) + category.charCodeAt(category.length - 1)) % colors.length

              return {
                category,
                amount: amount as number,
                color: colors[colorIndex],
              }
            })
            .sort((a, b) => b.amount - a.amount) // Sort by amount descending

          // Get previous month data for comparison
          const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

          const prevExpensesQuery = query(
            collection(db, "expenses"),
            where("userId", "==", user.uid),
            where("date", ">=", prevMonthStart.toISOString()),
            where("date", "<=", prevMonthEnd.toISOString()),
          )
          const prevExpensesSnapshot = await getDocs(prevExpensesQuery)
          let prevTotalExpenses = 0
          prevExpensesSnapshot.forEach((doc) => {
            prevTotalExpenses += doc.data().amount
          })

          const prevIncomeQuery = query(
            collection(db, "income"),
            where("userId", "==", user.uid),
            where("date", ">=", prevMonthStart.toISOString()),
            where("date", "<=", prevMonthEnd.toISOString()),
          )
          const prevIncomeSnapshot = await getDocs(prevIncomeQuery)
          let prevTotalIncome = 0
          prevIncomeSnapshot.forEach((doc) => {
            prevTotalIncome += doc.data().amount
          })

          const prevBalance = prevTotalIncome - prevTotalExpenses
          const prevSavingsRate = prevTotalIncome > 0 ? (prevBalance / prevTotalIncome) * 100 : 0

          // Calculate percentage changes
          const incomeChange = prevTotalIncome > 0 ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100 : 0
          const expenseChange =
            prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0
          const balanceChange = prevBalance > 0 ? ((balance - prevBalance) / prevBalance) * 100 : 0
          const savingsChange = prevSavingsRate > 0 ? savingsRate - prevSavingsRate : 0

          setFinancialData({
            totalBalance: balance,
            monthlyIncome: totalIncome,
            monthlyExpenses: totalExpenses,
            savingsRate,
            incomeChange,
            expenseChange,
            balanceChange,
            savingsChange,
            recentTransactions,
            expenseBreakdown,
          })
        } catch (error) {
          console.error("Error fetching dashboard data:", error)

          // Set fallback data
          setFinancialData({
            totalBalance: 10000,
            monthlyIncome: 45000,
            monthlyExpenses: 35000,
            savingsRate: 22,
            incomeChange: 5,
            expenseChange: -3,
            balanceChange: 8,
            savingsChange: 2,
            recentTransactions: [
              { description: "Groceries", amount: 2500, date: "15 May 2023", type: "expense" },
              { description: "Salary", amount: 45000, date: "01 May 2023", type: "income" },
              { description: "Rent", amount: 15000, date: "05 May 2023", type: "expense" },
              { description: "Dining Out", amount: 3500, date: "10 May 2023", type: "expense" },
              { description: "Freelance Work", amount: 8000, date: "12 May 2023", type: "income" },
            ],
            expenseBreakdown: [
              { category: "Food & Dining", amount: 15000, color: "#3b82f6" },
              { category: "Transportation", amount: 9000, color: "#10b981" },
              { category: "Entertainment", amount: 6000, color: "#f59e0b" },
              { category: "Housing", amount: 18000, color: "#ef4444" },
              { category: "Utilities", amount: 6000, color: "#8b5cf6" },
            ],
          })
        } finally {
          // Reduced timeout for better UX
          setTimeout(() => {
            setLoading(false)
          }, 500)
        }
      }
    }

    fetchData()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.displayName || "User"}! Here's an overview of your finances.
            </p>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <QuickActionButtons />
          </motion.div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                <>
                  <Skeleton className="h-[120px]" />
                  <Skeleton className="h-[120px]" />
                  <Skeleton className="h-[120px]" />
                  <Skeleton className="h-[120px]" />
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(financialData?.totalBalance || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {financialData?.balanceChange > 0 ? "+" : ""}
                        {financialData?.balanceChange.toFixed(1) || 0}% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(financialData?.monthlyIncome || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {financialData?.incomeChange > 0 ? "+" : ""}
                        {financialData?.incomeChange.toFixed(1) || 0}% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(financialData?.monthlyExpenses || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {financialData?.expenseChange > 0 ? "+" : ""}
                        {financialData?.expenseChange.toFixed(1) || 0}% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{financialData?.savingsRate.toFixed(1) || 0}%</div>
                      <p className="text-xs text-muted-foreground">
                        {financialData?.savingsChange > 0 ? "+" : ""}
                        {financialData?.savingsChange.toFixed(1) || 0}% from last month
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                  <CardDescription>Your financial activity for the current month</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {loading ? (
                    <Skeleton className="h-[300px]" />
                  ) : (
                    <div className="h-[300px]">
                      {financialData?.expenseBreakdown && financialData.expenseBreakdown.length > 0 ? (
                        <ExpenseBreakdownChart data={financialData.expenseBreakdown} title="" description="" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No expense data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-[40px]" />
                      <Skeleton className="h-[40px]" />
                      <Skeleton className="h-[40px]" />
                      <Skeleton className="h-[40px]" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(financialData?.recentTransactions || []).map((transaction: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${transaction.type === "expense" ? "bg-red-500" : "bg-green-500"}`}
                            ></div>
                            <div>
                              <p className="text-sm font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">{transaction.date}</p>
                            </div>
                          </div>
                          <p
                            className={`text-sm font-medium ${transaction.type === "expense" ? "text-red-500" : "text-green-500"}`}
                          >
                            {transaction.type === "expense" ? "-" : "+"}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      ))}
                      {(financialData?.recentTransactions || []).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">No recent transactions found</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Analysis</CardTitle>
                <CardDescription>Breakdown of your income sources</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[400px]" />
                ) : (
                  <div className="h-[400px]">
                    {/* Income chart component would go here */}
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Income analysis visualization will appear here
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Analysis</CardTitle>
                <CardDescription>Breakdown of your spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[400px]" />
                ) : (
                  <div className="h-[400px]">
                    {financialData?.expenseBreakdown && financialData.expenseBreakdown.length > 0 ? (
                      <ExpenseBreakdownChart data={financialData.expenseBreakdown} title="" description="" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No expense data available
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="savings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Savings Analysis</CardTitle>
                <CardDescription>Track your savings progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[400px]" />
                ) : (
                  <div className="h-[400px]">
                    {/* Savings chart component would go here */}
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Savings analysis visualization will appear here
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track progress towards your financial goals</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[400px]" />
                ) : (
                  <div className="h-[400px]">
                    {/* Goals chart component would go here */}
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Financial goals visualization will appear here
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}
