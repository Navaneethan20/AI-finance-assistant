"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

interface BudgetCategory {
  category: string
  budgeted: number
  spent: number
  color: string
}

export default function BudgetInsights() {
  const [timeframe, setTimeframe] = useState("monthly")

  // Sample data - in a real app, this would come from the database
  const budgetData: BudgetCategory[] = [
    {
      category: "Housing",
      budgeted: 10000,
      spent: 9500,
      color: "bg-blue-500",
    },
    {
      category: "Food & Dining",
      budgeted: 6000,
      spent: 5200,
      color: "bg-green-500",
    },
    {
      category: "Transportation",
      budgeted: 3000,
      spent: 3200,
      color: "bg-yellow-500",
    },
    {
      category: "Entertainment",
      budgeted: 2000,
      spent: 2500,
      color: "bg-purple-500",
    },
    {
      category: "Utilities",
      budgeted: 3500,
      spent: 3300,
      color: "bg-red-500",
    },
    {
      category: "Shopping",
      budgeted: 2500,
      spent: 3100,
      color: "bg-orange-500",
    },
  ]

  const totalBudgeted = budgetData.reduce((sum, item) => sum + item.budgeted, 0)
  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
  const savingsRate = ((totalBudgeted - totalSpent) / totalBudgeted) * 100

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Insights</h1>
          <p className="text-muted-foreground">Visualize and analyze your budget performance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalBudgeted.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  for {timeframe === "monthly" ? "this month" : "this year"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  for {timeframe === "monthly" ? "this month" : "this year"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(totalBudgeted - totalSpent).toLocaleString()}</div>
                <Progress value={(totalSpent / totalBudgeted) * 100} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{savingsRate > 0 ? "Under budget" : "Over budget"}</p>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>
                  Your overall budget performance for {timeframe === "monthly" ? "this month" : "this year"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Chart visualization will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget by Category</CardTitle>
                <CardDescription>Track your spending across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetData.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm">
                          ₹{item.spent.toLocaleString()} / ₹{item.budgeted.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`absolute inset-y-0 left-0 ${item.color}`}
                          style={{ width: `${Math.min(100, (item.spent / item.budgeted) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round((item.spent / item.budgeted) * 100)}% of budget</span>
                        <span>
                          {item.spent > item.budgeted
                            ? `₹${(item.spent - item.budgeted).toLocaleString()} over`
                            : `₹${(item.budgeted - item.spent).toLocaleString()} left`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Track how your spending has changed over time</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Trend visualization will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}

