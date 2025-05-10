import * as admin from "firebase-admin"

// Check if Firebase Admin is already initialized
const apps = admin.apps

// Initialize Firebase Admin if not already initialized
if (!apps.length) {
  try {
    // Handle the private key format properly
    let privateKey = process.env.FIREBASE_PRIVATE_KEY

    // If the key starts with quotation marks, remove them
    if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1)
    }

    // Replace escaped newlines with actual newlines
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n")
    }

    // Create the credential object
    const credential = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }

    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert(credential),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log("Firebase Admin initialized successfully")
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)

    // Log more details about the private key for debugging
    // Be careful not to expose the actual key in production logs
    if (process.env.NODE_ENV !== "production") {
      const privateKeyStart = process.env.FIREBASE_PRIVATE_KEY?.substring(0, 15)
      console.error(`Private key starts with: ${privateKeyStart}...`)
      console.error(`Private key length: ${process.env.FIREBASE_PRIVATE_KEY?.length}`)
    }

    throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Export Firestore, Auth, and Storage instances
export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminStorage = admin.storage()
