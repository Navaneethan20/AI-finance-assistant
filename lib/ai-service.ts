// Mock function for statement processing (client-side only)
export async function processStatement(statementId: string, userId: string) {
  console.log("Processing statement (client-side mock):", statementId, userId)

  // In a real app, this would call a server API
  // For preview, we'll return mock data
  return {
    success: true,
    transactionCount: Math.floor(Math.random() * 20) + 5,
  }
}

// Client-side expense categorization
export async function predictExpenseCategory(description: string, amount: number) {
  try {
    // In a real app, this would use a TensorFlow.js model
    // For preview, we'll use a simple rule-based approach
    const lowerDesc = description.toLowerCase()

    if (lowerDesc.includes("food") || lowerDesc.includes("restaurant") || lowerDesc.includes("cafe")) {
      return "Food & Dining"
    } else if (lowerDesc.includes("uber") || lowerDesc.includes("taxi") || lowerDesc.includes("transport")) {
      return "Transportation"
    } else if (lowerDesc.includes("movie") || lowerDesc.includes("entertainment")) {
      return "Entertainment"
    } else if (lowerDesc.includes("rent") || lowerDesc.includes("mortgage")) {
      return "Housing"
    } else if (lowerDesc.includes("bill") || lowerDesc.includes("utility")) {
      return "Utilities"
    } else if (lowerDesc.includes("shop") || lowerDesc.includes("store") || lowerDesc.includes("amazon")) {
      return "Shopping"
    } else if (lowerDesc.includes("doctor") || lowerDesc.includes("medical") || lowerDesc.includes("pharmacy")) {
      return "Healthcare"
    } else {
      return "Other"
    }
  } catch (error) {
    console.error("Error predicting category:", error)
    return "Other" // Default category on error
  }
}

