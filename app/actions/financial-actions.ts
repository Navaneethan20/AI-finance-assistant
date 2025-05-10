"use server"

import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie"
import { updateUserConsolidatedCSV } from "@/lib/consolidated-csv-service"
import { updateLastTransactionTimestamp } from "@/lib/ai-model-integration"

// Helper function to get the user ID from the auth token
async function getUserIdFromToken() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)

  if (!authCookie) {
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

export async function addExpense(formData: FormData) {
  try {
    const userId = await getUserIdFromToken()

    if (!userId) {
      return { success: false, message: "Unauthorized. Please log in again." }
    }

    const amount = formData.get("amount") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const category = formData.get("category") as string

    if (!amount || !date) {
      return { success: false, message: "Missing required fields" }
    }

    // Use a simple category prediction based on description
    let finalCategory = category
    if (!finalCategory && description) {
      finalCategory = predictCategory(description)
    }

    const expenseId = uuidv4()
    const expenseData = {
      id: expenseId,
      userId,
      amount: Number(amount),
      category: finalCategory || "Other",
      description: description || "",
      date: date,
      createdAt: new Date().toISOString(),
    }

    // Add to Firestore
    await adminDb.collection("expenses").doc(expenseId).set(expenseData)

    // Update the transaction timestamp to invalidate AI analysis cache
    await updateLastTransactionTimestamp(userId)

    // Update the consolidated CSV file
    try {
      await updateUserConsolidatedCSV(userId)
    } catch (csvError) {
      console.error("Error updating consolidated CSV:", csvError)
      // Continue even if CSV update fails
    }

    return { success: true, message: "Expense added successfully" }
  } catch (error) {
    console.error("Error adding expense:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add expense. Please try again.",
    }
  }
}

export async function addIncome(formData: FormData) {
  try {
    const userId = await getUserIdFromToken()

    if (!userId) {
      return { success: false, message: "Unauthorized. Please log in again." }
    }

    const amount = formData.get("amount") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const category = formData.get("category") as string

    if (!amount || !date) {
      return { success: false, message: "Missing required fields" }
    }

    const incomeId = uuidv4()
    const incomeData = {
      id: incomeId,
      userId,
      amount: Number(amount),
      category: category || "Other",
      description: description || "",
      date: date,
      createdAt: new Date().toISOString(),
    }

    // Add to Firestore
    await adminDb.collection("income").doc(incomeId).set(incomeData)

    // Update the transaction timestamp to invalidate AI analysis cache
    await updateLastTransactionTimestamp(userId)

    // Update the consolidated CSV file
    try {
      await updateUserConsolidatedCSV(userId)
    } catch (csvError) {
      console.error("Error updating consolidated CSV:", csvError)
      // Continue even if CSV update fails
    }

    return { success: true, message: "Income added successfully" }
  } catch (error) {
    console.error("Error adding income:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add income. Please try again.",
    }
  }
}

// Simple category prediction function
function predictCategory(description: string): string {
  const lowerDesc = description.toLowerCase()

  if (
    lowerDesc.includes("food") ||
    lowerDesc.includes("restaurant") ||
    lowerDesc.includes("cafe") ||
    lowerDesc.includes("lunch") ||
    lowerDesc.includes("dinner")
  ) {
    return "Food & Dining"
  } else if (
    lowerDesc.includes("uber") ||
    lowerDesc.includes("taxi") ||
    lowerDesc.includes("transport") ||
    lowerDesc.includes("bus") ||
    lowerDesc.includes("train")
  ) {
    return "Transportation"
  } else if (
    lowerDesc.includes("movie") ||
    lowerDesc.includes("entertainment") ||
    lowerDesc.includes("netflix") ||
    lowerDesc.includes("spotify")
  ) {
    return "Entertainment"
  } else if (lowerDesc.includes("rent") || lowerDesc.includes("mortgage") || lowerDesc.includes("apartment")) {
    return "Housing"
  } else if (
    lowerDesc.includes("bill") ||
    lowerDesc.includes("utility") ||
    lowerDesc.includes("electric") ||
    lowerDesc.includes("water")
  ) {
    return "Utilities"
  } else if (
    lowerDesc.includes("shop") ||
    lowerDesc.includes("store") ||
    lowerDesc.includes("amazon") ||
    lowerDesc.includes("purchase")
  ) {
    return "Shopping"
  } else if (
    lowerDesc.includes("doctor") ||
    lowerDesc.includes("medical") ||
    lowerDesc.includes("pharmacy") ||
    lowerDesc.includes("hospital")
  ) {
    return "Healthcare"
  } else {
    return "Other"
  }
}
