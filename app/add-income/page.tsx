"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { addIncome } from "@/app/actions/financial-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Dividends",
  "Rental",
  "Interest",
  "Gifts",
  "Tax Refund",
  "Other",
]

export default function AddIncome() {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    if (!amount || !category) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields",
      })
      return
    }

    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append("amount", amount)
      formData.append("category", category)
      formData.append("description", description)
      formData.append("date", date.toISOString())

      // Use the server action
      const result = await addIncome(formData)

      if (result.success) {
        setStatus({
          type: "success",
          message: result.message,
        })

        // Reset form
        setAmount("")
        setCategory("")
        setDescription("")
        setDate(new Date())

        // Navigate to transactions after a delay
        setTimeout(() => {
          router.push("/transactions")
        }, 2000)
      }
    } catch (error) {
      console.error("Error adding income:", error)
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to add income. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Income</h1>
          <p className="text-muted-foreground">Record new income to track your earnings</p>
        </div>

        {status && (
          <Alert
            variant={status.type === "success" ? "default" : "destructive"}
            className={cn(
              "animate-fade-in-up border-l-4",
              status.type === "success" ? "border-l-green-500" : "border-l-red-500",
            )}
          >
            {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{status.type === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Income Details</CardTitle>
            <CardDescription>Fill in the details of your income</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this income"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding income...
                  </span>
                ) : (
                  "Add Income"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
