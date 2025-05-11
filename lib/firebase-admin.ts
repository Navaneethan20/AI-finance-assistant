import * as admin from "firebase-admin"

// Check if Firebase Admin is already initialized
const apps = admin.apps

// Initialize Firebase Admin if not already initialized
if (!apps.length) {
  try {
    // Get the service account credentials
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle the private key format properly
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }

    // Initialize the app with the service account
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log("Firebase Admin initialized successfully")
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)

    // Log more details about the environment for debugging
    console.error(`Project ID: ${process.env.FIREBASE_PROJECT_ID}`)
    console.error(`Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`)
    console.error(`Private Key exists: ${Boolean(process.env.FIREBASE_PRIVATE_KEY)}`)
    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.error(`Private Key length: ${process.env.FIREBASE_PRIVATE_KEY.length}`)
      console.error(`Private Key starts with: ${process.env.FIREBASE_PRIVATE_KEY.substring(0, 30)}...`)
    }
  }
}

// Export Firestore, Auth, and Storage instances
export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminStorage = admin.storage()
