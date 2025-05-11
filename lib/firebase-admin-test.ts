import { adminAuth } from "./firebase-admin"

// This function can be called to test if Firebase Admin is properly initialized
export async function testFirebaseAdmin() {
  try {
    // Try to list users (limited to 1) to verify the connection
    const listUsersResult = await adminAuth.listUsers(1)
    return {
      success: true,
      message: `Firebase Admin initialized successfully. Found ${listUsersResult.users.length} users.`,
    }
  } catch (error) {
    console.error("Firebase Admin test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    }
  }
}
