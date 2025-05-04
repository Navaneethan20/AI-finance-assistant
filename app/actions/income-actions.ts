"use server"

import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie"
import { updateUserConsolidatedCSV } from "@/lib/consolidated-csv-service"
import { updateLastTransactionTimestamp } from "@/lib/ai-model-integration"
import { redirect } from "next/navigation"

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

export async function addIncome(formData: FormData) {
  const userId = await getUserIdFromToken()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const amount = formData.get("amount") as string
  const description = formData.get("description") as string
  const date = formData.get("date") as string
  const category = formData.get("category") as string

  if (!amount || !date) {
    throw new Error("Missing required fields")
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

  try {
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

    // Redirect to transactions page
    redirect("/transactions")
  } catch (error) {
    console.error("Error adding income:", error)
    throw new Error("Failed to add income. Please try again.")
  }
}
