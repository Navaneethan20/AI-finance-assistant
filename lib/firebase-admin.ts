import * as admin from "firebase-admin"

// Check if Firebase Admin is already initialized
const apps = admin.apps

// Initialize Firebase Admin if not already initialized
if (!apps.length) {
  // Parse the Firebase private key properly
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

// Export Firestore, Auth, and Storage instances
export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminStorage = admin.storage()
