"use server"

import { cookies } from "next/headers"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie"
import { updateLastTransactionTimestamp } from "@/lib/ai-model-integration"

// Helper function to get the user ID from the auth token
async function getUserIdFromToken() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)

  if (!authCookie) {
    console.error("No auth cookie found")
    return null
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(authCookie.value)
    return decodedToken.uid
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

// Delete a single transaction
export async function deleteTransaction(formData: FormData) {
  try {
    const userId = await getUserIdFromToken()

    if (!userId) {
      return { success: false, message: "Unauthorized. Please log in again." }
    }

    const transactionId = formData.get("transactionId") as string
    const transactionType = formData.get("transactionType") as string

    if (!transactionId || !transactionType) {
      return { success: false, message: "Missing required fields" }
    }

    // Delete from Firestore
    const collectionName = transactionType === "expense" ? "expenses" : "income"
    await adminDb.collection(collectionName).doc(transactionId).delete()

    // Update the transaction timestamp to invalidate AI analysis cache
    await updateLastTransactionTimestamp(userId)

    return { success: true, message: "Transaction deleted successfully" }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete transaction. Please try again.",
    }
  }
}

// Delete multiple transactions
export async function deleteMultipleTransactions(formData: FormData) {
  try {
    const userId = await getUserIdFromToken()

    if (!userId) {
      return { success: false, message: "Unauthorized. Please log in again." }
    }

    const transactionIds = formData.get("transactionIds") as string
    const transactionTypes = formData.get("transactionTypes") as string

    if (!transactionIds || !transactionTypes) {
      return { success: false, message: "Missing required fields" }
    }

    const ids = JSON.parse(transactionIds) as string[]
    const types = JSON.parse(transactionTypes) as string[]

    if (ids.length !== types.length) {
      return { success: false, message: "Transaction IDs and types must have the same length" }
    }

    // Create a batch for efficient writes
    const batch = adminDb.batch()

    // Add each transaction to the batch
    for (let i = 0; i < ids.length; i++) {
      const collectionName = types[i] === "expense" ? "expenses" : "income"
      const docRef = adminDb.collection(collectionName).doc(ids[i])
      batch.delete(docRef)
    }

    // Commit the batch
    await batch.commit()

    // Update the transaction timestamp to invalidate AI analysis cache
    await updateLastTransactionTimestamp(userId)

    return { success: true, message: `${ids.length} transactions deleted successfully` }
  } catch (error) {
    console.error("Error deleting multiple transactions:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete transactions. Please try again.",
    }
  }
}

// Delete all transactions for a user
export async function deleteAllTransactions(formData: FormData) {
  try {
    const userId = await getUserIdFromToken()

    if (!userId) {
      return { success: false, message: "Unauthorized. Please log in again." }
    }

    // Delete all expenses
    const expensesSnapshot = await adminDb.collection("expenses").where("userId", "==", userId).get()
    const expensesBatch = adminDb.batch()
    expensesSnapshot.forEach((doc) => {
      expensesBatch.delete(doc.ref)
    })
    await expensesBatch.commit()

    // Delete all income
    const incomeSnapshot = await adminDb.collection("income").where("userId", "==", userId).get()
    const incomeBatch = adminDb.batch()
    incomeSnapshot.forEach((doc) => {
      incomeBatch.delete(doc.ref)
    })
    await incomeBatch.commit()

    // Update the transaction timestamp to invalidate AI analysis cache
    await updateLastTransactionTimestamp(userId)

    return {
      success: true,
      message: `All transactions deleted successfully (${expensesSnapshot.size} expenses and ${incomeSnapshot.size} income entries)`,
    }
  } catch (error) {
    console.error("Error deleting all transactions:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete all transactions. Please try again.",
    }
  }
}
