import * as admin from "firebase-admin"

// Check if Firebase Admin is already initialized
const apps = admin.apps

// Initialize Firebase Admin if not already initialized
if (!apps.length) {
  try {
    // Try to use service account JSON if available
    let credential

    if (process.env.FIREBASE_ADMIN_SDK) {
      try {
        const serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK)
        credential = admin.credential.cert(serviceAccountJson)
      } catch (jsonError) {
        console.error("Error parsing FIREBASE_ADMIN_SDK JSON:", jsonError)
        // Fall back to individual credentials
      }
    }

    // If we couldn't use the JSON, try individual credentials
    if (!credential) {
      // Get the private key and handle all possible formats
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || ""

      // Remove quotes if present
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1)
      }

      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, "\n")

      // Create a clean service account object
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }

      credential = admin.credential.cert(serviceAccount)
    }

    // Initialize the app with the credential
    admin.initializeApp({
      credential,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log("Firebase Admin initialized successfully")
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)

    // Log environment variable information for debugging
    console.error("Environment variables check:")
    console.error(`- FIREBASE_PROJECT_ID: ${Boolean(process.env.FIREBASE_PROJECT_ID)}`)
    console.error(`- FIREBASE_CLIENT_EMAIL: ${Boolean(process.env.FIREBASE_CLIENT_EMAIL)}`)
    console.error(`- FIREBASE_PRIVATE_KEY exists: ${Boolean(process.env.FIREBASE_PRIVATE_KEY)}`)

    if (process.env.FIREBASE_PRIVATE_KEY) {
      const key = process.env.FIREBASE_PRIVATE_KEY
      console.error(`- FIREBASE_PRIVATE_KEY length: ${key.length}`)
      console.error(`- FIREBASE_PRIVATE_KEY starts with: ${key.substring(0, 20)}...`)
      console.error(`- FIREBASE_PRIVATE_KEY contains "\\n": ${key.includes("\\n")}`)
      console.error(`- FIREBASE_PRIVATE_KEY contains actual newlines: ${key.includes("\n")}`)
    }

    throw new Error(`Firebase Admin initialization failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Export Firestore, Auth, and Storage instances
export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminStorage = admin.storage()
