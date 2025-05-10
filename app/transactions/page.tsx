"use client"

import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { format } from "date-fns"
import { Download, ArrowUpDown, Trash2, CheckSquare, Square, AlertTriangle, AlertCircle } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { useCSV } from "@/hooks/use-csv"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { deleteTransaction, deleteMultipleTransactions, deleteAllTransactions } from "@/app/actions/transaction-actions"
import { UnifiedLoader } from "@/components/ui/unified-loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        setError(null)

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
            id: doc.id,
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
            id: doc.id,
            type: "income",
          } as Transaction)
        })

        // Combine and sort by date
        const allTransactions = [...fetchedExpenses, ...fetchedIncome].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )

        setTransactions(allTransactions)
        setFilteredTransactions(allTransactions)
        setSelectedTransactions([])
        setIsAllSelected(false)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setError("Failed to load transactions. Please try refreshing the page.")
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

    // Reset selection when filters change
    setSelectedTransactions([])
    setIsAllSelected(false)
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

  const toggleSelectTransaction = (id: string) => {
    setSelectedTransactions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((transId) => transId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const toggleSelectAll = () => {
    if (isAllSelected || selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([])
      setIsAllSelected(false)
    } else {
      setSelectedTransactions(filteredTransactions.map((t) => t.id))
      setIsAllSelected(true)
    }
  }

  const handleDeleteTransaction = async (id: string, type: string) => {
    try {
      setIsDeleting(true)
      setError(null)

      const formData = new FormData()
      formData.append("transactionId", id)
      formData.append("transactionType", type)

      const result = await deleteTransaction(formData)

      if (result.success) {
        // Remove from local state
        setTransactions((prev) => prev.filter((t) => t.id !== id))
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        throw new Error(result.message || "Failed to delete transaction")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      setError("Failed to delete transaction. Please try again.")
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) return

    try {
      setIsDeleting(true)
      setError(null)

      const transactionIds = selectedTransactions
      const transactionTypes = selectedTransactions.map((id) => {
        const transaction = transactions.find((t) => t.id === id)
        return transaction?.type || "expense"
      })

      const formData = new FormData()
      formData.append("transactionIds", JSON.stringify(transactionIds))
      formData.append("transactionTypes", JSON.stringify(transactionTypes))

      const result = await deleteMultipleTransactions(formData)

      if (result.success) {
        // Remove from local state
        setTransactions((prev) => prev.filter((t) => !selectedTransactions.includes(t.id)))
        setSelectedTransactions([])
        setShowDeleteConfirm(false)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        throw new Error(result.message || "Failed to delete selected transactions")
      }
    } catch (error) {
      console.error("Error deleting transactions:", error)
      setError("Failed to delete selected transactions. Please try again.")
      toast({
        title: "Error",
        description: "Failed to delete selected transactions",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    try {
      setIsDeletingAll(true)
      setError(null)

      const formData = new FormData()
      const result = await deleteAllTransactions(formData)

      if (result.success) {
        // Clear local state
        setTransactions([])
        setSelectedTransactions([])
        setShowDeleteAllConfirm(false)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        throw new Error(result.message || "Failed to delete all transactions")
      }
    } catch (error) {
      console.error("Error deleting all transactions:", error)
      setError("Failed to delete all transactions. Please try again.")
      toast({
        title: "Error",
        description: "Failed to delete all transactions",
        variant: "destructive",
      })
    } finally {
      setIsDeletingAll(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transaction history</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A record of all your expenses and income</CardDescription>
              </div>
              {selectedTransactions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedTransactions.length} selected</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
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
                  <UnifiedLoader size="lg" text="Loading transactions..." />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={toggleSelectAll}
                            className="focus:outline-none"
                            aria-label={isAllSelected ? "Deselect all transactions" : "Select all transactions"}
                          >
                            {isAllSelected || selectedTransactions.length === filteredTransactions.length ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="group">
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => toggleSelectTransaction(transaction.id)}
                              className="focus:outline-none"
                              aria-label={
                                selectedTransactions.includes(transaction.id)
                                  ? "Deselect transaction"
                                  : "Select transaction"
                              }
                            >
                              {selectedTransactions.includes(transaction.id) ? (
                                <CheckSquare className="h-5 w-5 text-primary" />
                              ) : (
                                <Square className="h-5 w-5 text-muted-foreground opacity-70 group-hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        </TableCell>
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
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction.id, transaction.type)}
                            disabled={isDeleting}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""} found
            </div>
            {transactions.length > 0 && (
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowDeleteAllConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Transactions
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Delete Selected Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Transactions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTransactions.length} selected transaction
              {selectedTransactions.length !== 1 ? "s" : ""}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteSelected} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <UnifiedLoader size="sm" variant="white" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Transactions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ALL transactions? This will remove all your expense and income records and
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteAll} disabled={isDeletingAll}>
              {isDeletingAll ? (
                <>
                  <UnifiedLoader size="sm" variant="white" className="mr-2" />
                  Deleting All...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Transactions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
}
