"use client"

import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { format } from "date-fns"
import { Search, Filter, Download, ArrowUpDown } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"

interface Transaction {
  id: string
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

        const q = query(collection(db, "expenses"), where("userId", "==", user.uid), orderBy("date", "desc"))

        const querySnapshot = await getDocs(q)
        const fetchedTransactions: Transaction[] = []

        querySnapshot.forEach((doc) => {
          fetchedTransactions.push(doc.data() as Transaction)
        })

        setTransactions(fetchedTransactions)
        setFilteredTransactions(fetchedTransactions)
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

  const handleExport = () => {
    // In a real app, this would generate a CSV file
    toast({
      title: "Export Started",
      description: "Your transactions are being exported to CSV",
    })
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
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <div className="w-40">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="icon" onClick={toggleSortDirection}>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="icon" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No transactions found</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description || "-"}</TableCell>
                        <TableCell className="text-right font-medium">₹{transaction.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}

