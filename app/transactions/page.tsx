"use client"

import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { format } from "date-fns"
import { Download, ArrowUpDown } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { useCSV } from "@/hooks/use-csv"

interface Transaction {
  id: string
  type: "expense" | "income"
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const { user } = useAuth()
  const { toast } = useToast()
  const { downloadCSV, isGenerating } = useCSV()

  const categories = [
    "All Categories",
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Housing",
    "Utilities",
    "Shopping",
    "Healthcare",
    "Education",
    "Travel",
    "Personal Care",
    "Gifts & Donations",
    "Other",
  ]

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Fetch expenses
        const expensesQuery = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
        )
        const expensesSnapshot = await getDocs(expensesQuery)
        const fetchedExpenses: Transaction[] = []

        expensesSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Transaction, "type">
          fetchedExpenses.push({
            ...data,
            type: "expense",
          } as Transaction)
        })

        // Fetch income
        const incomeQuery = query(collection(db, "income"), where("userId", "==", user.uid), orderBy("date", "desc"))
        const incomeSnapshot = await getDocs(incomeQuery)
        const fetchedIncome: Transaction[] = []

        incomeSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Transaction, "type">
          fetchedIncome.push({
            ...data,
            type: "income",
          } as Transaction)
        })

        // Combine and sort by date
        const allTransactions = [...fetchedExpenses, ...fetchedIncome].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )

        setTransactions(allTransactions)
        setFilteredTransactions(allTransactions)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user, toast])

  useEffect(() => {
    // Apply filters and search
    let result = [...transactions]

    // Apply category filter
    if (categoryFilter && categoryFilter !== "All Categories") {
      result = result.filter((transaction) => transaction.category === categoryFilter)
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(term) ||
          transaction.category.toLowerCase().includes(term) ||
          transaction.amount.toString().includes(term),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

    setFilteredTransactions(result)
  }, [transactions, searchTerm, categoryFilter, sortDirection])

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const handleExport = async () => {
    try {
      await downloadCSV("transactions.csv")
      toast({
        title: "Success",
        description: "Transactions exported successfully",
      })
    } catch (error) {
      console.error("Error exporting transactions:", error)
      toast({
        title: "Error",
        description: "Failed to export transactions",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transaction history</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>A record of all your expenses and income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-2"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={toggleSortDirection} className="flex-1">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {sortDirection === "desc" ? "Newest" : "Oldest"}
                </Button>
                <Button variant="outline" disabled={isGenerating} onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>

            <div className="relative overflow-x-auto mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="capitalize">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              transaction.type === "expense" ? "bg-red-500" : "bg-green-500"
                            }`}
                          ></span>
                          {transaction.type}
                        </TableCell>
                        <TableCell>{format(new Date(transaction.date), "dd MMM yyyy")}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{transaction.description || "-"}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.type === "expense" ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {transaction.type === "expense" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
