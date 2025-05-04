import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Generate a PDF report
export async function generatePDFReport(userId: string, reportType: string, dateRange: string): Promise<Blob> {
  try {
    // Fetch data based on report type
    const data = await fetchReportData(userId, reportType, dateRange)

    // Create PDF document
    const doc = new jsPDF()

    // Add title
    const title = getReportTitle(reportType)
    doc.setFontSize(18)
    doc.text(title, 14, 22)

    // Add date range
    doc.setFontSize(12)
    doc.text(`Date Range: ${formatDateRange(dateRange)}`, 14, 32)

    // Add generated date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38)

    // Add content based on report type
    if (reportType === "expense-summary") {
      addExpenseSummaryContent(doc, data)
    } else if (reportType === "income-expense") {
      addIncomeExpenseContent(doc, data)
    } else if (reportType === "spending-trends") {
      addSpendingTrendsContent(doc, data)
    } else if (reportType === "transaction-history") {
      addTransactionHistoryContent(doc, data)
    }

    // Return the PDF as a blob
    return doc.output("blob")
  } catch (error) {
    console.error("Error generating PDF report:", error)
    throw new Error("Failed to generate PDF report")
  }
}

// Generate a CSV report
export async function generateCSVReport(userId: string, reportType: string, dateRange: string): Promise<string> {
  try {
    // Fetch data based on report type
    const data = await fetchReportData(userId, reportType, dateRange)

    // Generate CSV content based on report type
    let csvContent = ""

    if (reportType === "expense-summary") {
      csvContent = generateExpenseSummaryCSV(data)
    } else if (reportType === "income-expense") {
      csvContent = generateIncomeExpenseCSV(data)
    } else if (reportType === "spending-trends") {
      csvContent = generateSpendingTrendsCSV(data)
    } else if (reportType === "transaction-history") {
      csvContent = generateTransactionHistoryCSV(data)
    }

    return csvContent
  } catch (error) {
    console.error("Error generating CSV report:", error)
    throw new Error("Failed to generate CSV report")
  }
}

// Fetch data for reports
async function fetchReportData(userId: string, reportType: string, dateRange: string) {
  // Get date range
  const { startDate, endDate } = getDateRangeFromString(dateRange)

  if (reportType === "expense-summary") {
    // Fetch expenses grouped by category
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("date", ">=", startDate.toISOString()),
      where("date", "<=", endDate.toISOString()),
    )

    const expensesSnapshot = await getDocs(expensesQuery)
    const expenses = []
    const categoryTotals = {}

    expensesSnapshot.forEach((doc) => {
      const data = doc.data()
      expenses.push(data)

      // Aggregate by category
      const category = data.category || "Uncategorized"
      categoryTotals[category] = (categoryTotals[category] || 0) + data.amount
    })

    return {
      expenses,
      categoryTotals,
      totalExpense: Object.values(categoryTotals).reduce((sum: number, amount: number) => sum + amount, 0),
      dateRange: { startDate, endDate },
    }
  } else if (reportType === "income-expense") {
    // Fetch expenses
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("date", ">=", startDate.toISOString()),
      where("date", "<=", endDate.toISOString()),
    )

    const expensesSnapshot = await getDocs(expensesQuery)
    const expenses = []
    let totalExpense = 0

    expensesSnapshot.forEach((doc) => {
      const data = doc.data()
      expenses.push(data)
      totalExpense += data.amount
    })

    // Fetch income
    const incomeQuery = query(
      collection(db, "income"),
      where("userId", "==", userId),
      where("date", ">=", startDate.toISOString()),
      where("date", "<=", endDate.toISOString()),
    )

    const incomeSnapshot = await getDocs(incomeQuery)
    const income = []
    let totalIncome = 0

    incomeSnapshot.forEach((doc) => {
      const data = doc.data()
      income.push(data)
      totalIncome += data.amount
    })

    return {
      expenses,
      income,
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
      dateRange: { startDate, endDate },
    }
  } else if (reportType === "spending-trends") {
    // Fetch expenses grouped by month
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("date", ">=", startDate.toISOString()),
      where("date", "<=", endDate.toISOString()),
      orderBy("date", "asc"),
    )

    const expensesSnapshot = await getDocs(expensesQuery)
    const expenses = []
    const monthlyTotals = {}

    expensesSnapshot.forEach((doc) => {
      const data = doc.data()
      expenses.push(data)

      // Aggregate by month
      const date = new Date(data.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      const monthName = date.toLocaleString("default", { month: "long", year: "numeric" })

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          month: monthName,
          total: 0,
        }
      }

      monthlyTotals[monthKey].total += data.amount
    })

    return {
      expenses,
      monthlyTotals: Object.values(monthlyTotals),
      dateRange: { startDate, endDate },
    }
  } else if (reportType === "transaction-history") {
    // Fetch all transactions (expenses and income)
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("date", ">=", startDate.toISOString()),
      where("date", "<=", endDate.toISOString()),
      orderBy("date", "desc"),
    )

    const expensesSnapshot = await getDocs(expensesQuery)
    const expenses = []

    expensesSnapshot.forEach((doc) => {
      const data = doc.data()
      expenses.push({
        ...data,
        type: "expense",
      })
    })

    const incomeQuery = query(
      collection(db, "income"),
      where("userId", "==", userId),
      where("date", ">=", startDate.toISOString()),
      where("date", "<=", endDate.toISOString()),
      orderBy("date", "desc"),
    )

    const incomeSnapshot = await getDocs(incomeQuery)
    const income = []

    incomeSnapshot.forEach((doc) => {
      const data = doc.data()
      income.push({
        ...data,
        type: "income",
      })
    })

    // Combine and sort by date
    const transactions = [...expenses, ...income].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    return {
      transactions,
      dateRange: { startDate, endDate },
    }
  }

  return {}
}

// Helper functions for PDF generation
function addExpenseSummaryContent(doc, data) {
  // Add total expense
  doc.setFontSize(14)
  doc.text(`Total Expenses: ₹${data.totalExpense.toLocaleString()}`, 14, 50)

  // Add category breakdown table
  const tableData = Object.entries(data.categoryTotals).map(([category, amount]) => [
    category,
    `₹${(amount as number).toLocaleString()}`,
    `${(((amount as number) / data.totalExpense) * 100).toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: 60,
    head: [["Category", "Amount", "Percentage"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  })
}

function addIncomeExpenseContent(doc, data) {
  // Add summary
  doc.setFontSize(14)
  doc.text(`Total Income: ₹${data.totalIncome.toLocaleString()}`, 14, 50)
  doc.text(`Total Expenses: ₹${data.totalExpense.toLocaleString()}`, 14, 58)
  doc.text(`Balance: ₹${data.balance.toLocaleString()}`, 14, 66)
  doc.text(`Savings Rate: ${data.savingsRate.toFixed(1)}%`, 14, 74)

  // Add income table
  doc.setFontSize(12)
  doc.text("Income Breakdown", 14, 90)

  const incomeData = data.income.map((item) => [
    new Date(item.date).toLocaleDateString(),
    item.category || "Uncategorized",
    item.description || "-",
    `₹${item.amount.toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: 95,
    head: [["Date", "Category", "Description", "Amount"]],
    body: incomeData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Add expense table
  const currentY = doc.lastAutoTable.finalY + 15
  doc.setFontSize(12)
  doc.text("Expense Breakdown", 14, currentY)

  const expenseData = data.expenses.map((item) => [
    new Date(item.date).toLocaleDateString(),
    item.category || "Uncategorized",
    item.description || "-",
    `₹${item.amount.toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: currentY + 5,
    head: [["Date", "Category", "Description", "Amount"]],
    body: expenseData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  })
}

function addSpendingTrendsContent(doc, data) {
  // Add monthly spending table
  doc.setFontSize(14)
  doc.text("Monthly Spending Trends", 14, 50)

  const tableData = data.monthlyTotals.map((item) => [item.month, `₹${item.total.toLocaleString()}`])

  autoTable(doc, {
    startY: 60,
    head: [["Month", "Total Spending"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  })
}

function addTransactionHistoryContent(doc, data) {
  // Add transactions table
  doc.setFontSize(14)
  doc.text("Transaction History", 14, 50)

  const tableData = data.transactions.map((item) => [
    new Date(item.date).toLocaleDateString(),
    item.type.charAt(0).toUpperCase() + item.type.slice(1),
    item.category || "Uncategorized",
    item.description || "-",
    item.type === "income" ? `₹${item.amount.toLocaleString()}` : `-₹${item.amount.toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: 60,
    head: [["Date", "Type", "Category", "Description", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  })
}

// Helper functions for CSV generation
function generateExpenseSummaryCSV(data) {
  let csvContent = "Category,Amount,Percentage\n"

  Object.entries(data.categoryTotals).forEach(([category, amount]) => {
    const percentage = (((amount as number) / data.totalExpense) * 100).toFixed(1)
    csvContent += `${category},${amount},${percentage}%\n`
  })

  csvContent += `\nTotal,${data.totalExpense},100%\n`

  return csvContent
}

function generateIncomeExpenseCSV(data) {
  let csvContent = "Summary\n"
  csvContent += `Total Income,${data.totalIncome}\n`
  csvContent += `Total Expenses,${data.totalExpense}\n`
  csvContent += `Balance,${data.balance}\n`
  csvContent += `Savings Rate,${data.savingsRate.toFixed(1)}%\n\n`

  csvContent += "Income\n"
  csvContent += "Date,Category,Description,Amount\n"

  data.income.forEach((item) => {
    csvContent += `${new Date(item.date).toLocaleDateString()},${item.category || "Uncategorized"},${item.description || "-"},${item.amount}\n`
  })

  csvContent += "\nExpenses\n"
  csvContent += "Date,Category,Description,Amount\n"

  data.expenses.forEach((item) => {
    csvContent += `${new Date(item.date).toLocaleDateString()},${item.category || "Uncategorized"},${item.description || "-"},${item.amount}\n`
  })

  return csvContent
}

function generateSpendingTrendsCSV(data) {
  let csvContent = "Month,Total Spending\n"

  data.monthlyTotals.forEach((item) => {
    csvContent += `${item.month},${item.total}\n`
  })

  return csvContent
}

function generateTransactionHistoryCSV(data) {
  let csvContent = "Date,Type,Category,Description,Amount\n"

  data.transactions.forEach((item) => {
    const amount = item.type === "income" ? item.amount : -item.amount
    csvContent += `${new Date(item.date).toLocaleDateString()},${item.type},${item.category || "Uncategorized"},${item.description || "-"},${amount}\n`
  })

  return csvContent
}

// Helper functions
function getReportTitle(reportType: string): string {
  switch (reportType) {
    case "expense-summary":
      return "Expense Summary Report"
    case "income-expense":
      return "Income vs Expense Report"
    case "spending-trends":
      return "Spending Trends Report"
    case "transaction-history":
      return "Transaction History Report"
    default:
      return "Financial Report"
  }
}

function formatDateRange(dateRange: string): string {
  const { startDate, endDate } = getDateRangeFromString(dateRange)
  return `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
}

function getDateRangeFromString(dateRange: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  let startDate: Date
  let endDate = new Date()

  switch (dateRange) {
    case "current-month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case "last-month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case "last-3-months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      break
    case "last-6-months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
      break
    case "custom":
      // For custom, we expect the dates to be passed separately
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return { startDate, endDate }
}
