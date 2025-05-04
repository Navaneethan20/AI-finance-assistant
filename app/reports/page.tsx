"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, FileText, BarChart, PieChart, TrendingUp } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { doc, setDoc, collection, query, where, getDocs, orderBy, limit as firestoreLimit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { generatePDFReport, generateCSVReport } from "@/lib/report-generator"
import { StatusMessage } from "@/components/ui/status-message"

interface ReportType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export default function Reports() {
  const [reportType, setReportType] = useState("expense-summary")
  const [dateRange, setDateRange] = useState<
    "current-month" | "last-month" | "last-3-months" | "last-6-months" | "custom"
  >("current-month")
  const [fromDate, setFromDate] = useState<Date>(new Date())
  const [toDate, setToDate] = useState<Date>(new Date())
  const [fileFormat, setFileFormat] = useState<"pdf" | "csv">("pdf")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState<any[]>([])
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const { toast } = useToast()
  const { user } = useAuth()

  const reportTypes: ReportType[] = [
    {
      id: "expense-summary",
      title: "Expense Summary",
      description: "A summary of all your expenses by category",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      id: "income-expense",
      title: "Income vs Expense",
      description: "Compare your income and expenses over time",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      id: "spending-trends",
      title: "Spending Trends",
      description: "Analyze how your spending has changed over time",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: "transaction-history",
      title: "Transaction History",
      description: "A detailed list of all your transactions",
      icon: <FileText className="h-5 w-5" />,
    },
  ]

  // Fetch previously generated reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return

      try {
        const reportsQuery = query(
          collection(db, "reports"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          firestoreLimit(5),
        )

        const reportsSnapshot = await getDocs(reportsQuery)
        const fetchedReports = []

        reportsSnapshot.forEach((doc) => {
          fetchedReports.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        setGeneratedReports(fetchedReports)
      } catch (error) {
        console.error("Error fetching reports:", error)
        // Use mock data if fetch fails
        setGeneratedReports([
          {
            id: "report-1",
            title: "Expense Summary",
            date: new Date().toISOString(),
            url: "#",
            type: "pdf",
          },
          {
            id: "report-2",
            title: "Income vs Expense",
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            url: "#",
            type: "csv",
          },
        ])
      }
    }

    fetchReports()
  }, [user])

  const handleGenerateReport = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to generate reports",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setStatusMessage(null)

    try {
      // Generate report based on selected format
      let reportData, reportUrl, reportBlob

      if (fileFormat === "pdf") {
        reportBlob = await generatePDFReport(user.uid, reportType, dateRange)
        reportUrl = URL.createObjectURL(reportBlob)
      } else {
        const csvContent = await generateCSVReport(user.uid, reportType, dateRange)
        reportBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        reportUrl = URL.createObjectURL(reportBlob)
      }

      // Store report metadata in Firestore
      const reportId = `report-${Date.now()}`
      const reportTitle = reportTypes.find((r) => r.id === reportType)?.title || reportType

      const reportMetadata = {
        id: reportId,
        userId: user.uid,
        title: reportTitle,
        type: reportType,
        fileFormat: fileFormat,
        dateRange,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "reports", reportId), reportMetadata)

      // Update local state
      setGeneratedReports((prev) => [
        {
          ...reportMetadata,
          url: reportUrl,
          date: new Date().toISOString(),
        },
        ...prev,
      ])

      // Trigger download
      const link = document.createElement("a")
      link.href = reportUrl
      link.download = `${reportTitle.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.${fileFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setStatusMessage({
        type: "success",
        message: `Your ${reportTitle} report has been generated and downloaded successfully.`,
      })

      toast({
        title: "Report Generated",
        description: `Your ${reportTitle} report has been generated and downloaded`,
      })
    } catch (error) {
      console.error("Error generating report:", error)
      setStatusMessage({
        type: "error",
        message: "Failed to generate report. Please try again later.",
      })

      toast({
        title: "Error",
        description: "Failed to generate report. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = (report) => {
    try {
      // For previously generated reports, we'll regenerate them
      handleGenerateReport()
    } catch (error) {
      console.error("Error downloading report:", error)
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and download financial reports</p>
        </div>

        {statusMessage && (
          <StatusMessage
            type={statusMessage.type}
            message={statusMessage.message}
            onClose={() => setStatusMessage(null)}
          />
        )}

        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-none">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Create custom reports to analyze your finances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      <div className="flex items-center gap-2">
                        {report.icon}
                        <span>{report.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {reportTypes.find((r) => r.id === reportType)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={(date) => date && setFromDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={(date) => date && setToDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={fileFormat} onValueChange={(value: any) => setFileFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateReport} className="w-full" disabled={isGenerating}>
              {isGenerating ? (
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
                  Generating Report...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Download className="mr-2 h-4 w-4" />
                  Generate & Download Report
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Previously Generated Reports */}
        {generatedReports.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Recent Reports</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedReports.map((report) => (
                <Card key={report.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription>
                        {new Date(report.date || report.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => handleDownloadReport(report)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download {report.fileFormat?.toUpperCase() || "Report"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reportTypes.map((report) => (
            <Card key={report.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {report.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setReportType(report.id)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Quick Generate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
