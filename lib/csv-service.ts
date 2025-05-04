import { collection, query, where, getDocs, orderBy, doc, getDoc, setDoc } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

// Consolidated CSV service that maintains a single CSV file per user
export async function generateConsolidatedCSV(userId: string): Promise<string> {
  try {
    // 1. Fetch all user's expenses
    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", userId), orderBy("date", "desc"))
    const expensesSnapshot = await getDocs(expensesQuery)
    const expenses: any[] = []
    expensesSnapshot.forEach((doc) => {
      expenses.push({
        ...doc.data(),
        type: "expense",
      })
    })

    // 2. Fetch all user's income
    const incomeQuery = query(collection(db, "income"), where("userId", "==", userId), orderBy("date", "desc"))
    const incomeSnapshot = await getDocs(incomeQuery)
    const incomeItems: any[] = []
    incomeSnapshot.forEach((doc) => {
      incomeItems.push({
        ...doc.data(),
        type: "income",
      })
    })

    // 3. Combine and sort all financial data
    const allData = [...expenses, ...incomeItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    // 4. Convert to CSV format
    const csvContent = convertToCSV(allData)

    // 5. Upload to Firebase Storage
    const filePath = `users/${userId}/consolidated_financial_data.csv`
    const storageRef = ref(storage, filePath)
    await uploadString(storageRef, csvContent, "raw")

    // 6. Get download URL
    const downloadURL = await getDownloadURL(storageRef)

    // 7. Update user metadata with CSV info
    await updateUserCSVMetadata(userId, downloadURL)

    return downloadURL
  } catch (error) {
    console.error("Error generating consolidated CSV:", error)
    throw new Error("Failed to generate consolidated CSV")
  }
}

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  // Define CSV columns based on what the AI model expects
  const headers = ["id", "type", "date", "amount", "category", "description"]

  // Create the header row
  const headerRow = headers.join(",")

  // Create data rows
  const dataRows = data.map((item) => {
    return [
      item.id || "",
      item.type || "",
      item.date || "",
      item.amount || 0,
      item.category || "",
      `"${(item.description || "").replace(/"/g, '""')}"`, // Handle quotes in descriptions
    ].join(",")
  })

  // Combine header and rows
  return [headerRow, ...dataRows].join("\n")
}

// Update user metadata with CSV information
async function updateUserCSVMetadata(userId: string, csvUrl: string): Promise<void> {
  try {
    // Store metadata about the CSV file
    const userMetadataRef = doc(db, "users", userId)

    // Get current user doc
    const userDoc = await getDoc(userMetadataRef)

    // Update with CSV information
    await setDoc(
      userMetadataRef,
      {
        ...(userDoc.exists() ? userDoc.data() : {}),
        consolidatedCsvUrl: csvUrl,
        csvLastUpdated: Date.now(),
      },
      { merge: true },
    )
  } catch (error) {
    console.error("Error updating user CSV metadata:", error)
    throw error
  }
}

// Check if the CSV needs to be updated based on recent transactions
export async function checkAndUpdateCSV(userId: string): Promise<string> {
  try {
    // Get user metadata
    const userMetadataRef = doc(db, "users", userId)
    const userDoc = await getDoc(userMetadataRef)

    // If user doesn't exist or doesn't have a CSV, generate one
    if (!userDoc.exists() || !userDoc.data().consolidatedCsvUrl) {
      return await generateConsolidatedCSV(userId)
    }

    // Check if there are newer transactions since the last update
    const lastUpdated = userDoc.data().csvLastUpdated || 0

    // Check for newer expenses
    const newExpensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("createdAt", ">", new Date(lastUpdated).toISOString()),
    )
    const newExpensesSnapshot = await getDocs(newExpensesQuery)

    // Check for newer income
    const newIncomeQuery = query(
      collection(db, "income"),
      where("userId", "==", userId),
      where("createdAt", ">", new Date(lastUpdated).toISOString()),
    )
    const newIncomeSnapshot = await getDocs(newIncomeQuery)

    // If there are new transactions, regenerate the CSV
    if (!newExpensesSnapshot.empty || !newIncomeSnapshot.empty) {
      return await generateConsolidatedCSV(userId)
    }

    // Otherwise, return the existing URL
    return userDoc.data().consolidatedCsvUrl
  } catch (error) {
    console.error("Error checking and updating CSV:", error)
    // If there's an error, try to generate a new CSV
    return await generateConsolidatedCSV(userId)
  }
}
