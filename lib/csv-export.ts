import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Export expenses and income to CSV
export async function exportToCSV(userId: string): Promise<string> {
  try {
    // Fetch expenses
    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", userId), orderBy("date", "desc"))
    const expensesSnapshot = await getDocs(expensesQuery)
    const expenses = []
    expensesSnapshot.forEach((doc) => {
      const data = doc.data()
      expenses.push({
        id: data.id,
        type: "expense",
        date: data.date,
        amount: data.amount,
        category: data.category,
        description: data.description || "",
      })
    })

    // Fetch income
    const incomeQuery = query(collection(db, "income"), where("userId", "==", userId), orderBy("date", "desc"))
    const incomeSnapshot = await getDocs(incomeQuery)
    const income = []
    incomeSnapshot.forEach((doc) => {
      const data = doc.data()
      income.push({
        id: data.id,
        type: "income",
        date: data.date,
        amount: data.amount,
        category: data.category,
        description: data.description || "",
      })
    })

    // Combine and sort by date
    const allTransactions = [...expenses, ...income].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    // Create CSV header
    const csvHeader = ["id", "type", "date", "amount", "category", "description"].join(",")

    // Create CSV rows
    const csvRows = allTransactions.map((transaction) => {
      return [
        transaction.id,
        transaction.type,
        transaction.date,
        transaction.amount,
        transaction.category,
        `"${(transaction.description || "").replace(/"/g, '""')}"`, // Handle quotes in descriptions
      ].join(",")
    })

    // Combine header and rows
    return [csvHeader, ...csvRows].join("\n")
  } catch (error) {
    console.error("Error exporting to CSV:", error)
    throw new Error("Failed to export to CSV")
  }
}

// Function to update user's CSV files
export async function updateUserCSVFiles(userId: string): Promise<void> {
  try {
    // This function now delegates to the consolidated CSV service
    const { updateUserConsolidatedCSV } = require("./consolidated-csv-service")
    await updateUserConsolidatedCSV(userId)
  } catch (error) {
    console.error("Error updating user CSV files:", error)
    throw error
  }
}
