/**
 * Firebase Setup Instructions for Finsave Application
 *
 * This file contains instructions for setting up Firebase for the Finsave application.
 * Follow these steps to configure Firebase for your project.
 */

/**
 * 1. Firebase Project Setup
 *
 * - Go to the Firebase Console (https://console.firebase.google.com/)
 * - Create a new project or use an existing one
 * - Enable Authentication, Firestore, and Storage services
 */

/**
 * 2. Authentication Setup
 *
 * - In the Firebase Console, go to Authentication
 * - Enable Email/Password and Google sign-in methods
 * - Set up authorized domains for your application
 */

/**
 * 3. Firestore Database Structure
 *
 * The application uses the following collections:
 *
 * a. users
 *    - Document ID: User UID from Firebase Auth
 *    - Fields:
 *      - firstName: string
 *      - lastName: string
 *      - email: string
 *      - phone: string (optional)
 *      - createdAt: timestamp
 *      - lastAnalysisTimestamp: timestamp (optional)
 *      - consolidatedCsvUrl: string (optional)
 *      - csvLastUpdated: timestamp (optional)
 *
 * b. expenses
 *    - Document ID: Auto-generated or UUID
 *    - Fields:
 *      - id: string (same as document ID)
 *      - userId: string (reference to user)
 *      - amount: number
 *      - category: string
 *      - description: string (optional)
 *      - date: string (ISO date)
 *      - createdAt: string (ISO date)
 *
 * c. income
 *    - Document ID: Auto-generated or UUID
 *    - Fields:
 *      - id: string (same as document ID)
 *      - userId: string (reference to user)
 *      - amount: number
 *      - category: string
 *      - description: string (optional)
 *      - date: string (ISO date)
 *      - createdAt: string (ISO date)
 *
 * d. reports
 *    - Document ID: Auto-generated or UUID
 *    - Fields:
 *      - id: string (same as document ID)
 *      - userId: string (reference to user)
 *      - title: string
 *      - type: string (expense-summary, income-expense, spending-trends, transaction-history)
 *      - fileFormat: string (pdf, csv)
 *      - dateRange: string
 *      - fromDate: string (ISO date)
 *      - toDate: string (ISO date)
 *      - createdAt: string (ISO date)
 *
 * e. statements
 *    - Document ID: Auto-generated or UUID
 *    - Fields:
 *      - id: string (same as document ID)
 *      - userId: string (reference to user)
 *      - fileName: string
 *      - fileUrl: string
 *      - uploadDate: string (ISO date)
 *      - processed: boolean
 *      - processedData: object (optional)
 */

/**
 * 4. Firestore Security Rules
 *
 * Copy and paste these rules in the Firebase Console > Firestore > Rules
 */
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to subcollections
      match /{collection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Allow users to read and write their own expenses
    match /expenses/{expenseId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                   (resource.data == null || resource.data.userId == request.auth.uid) && 
                   request.resource.data.userId == request.auth.uid;
    }
    
    // Allow users to read and write their own income
    match /income/{incomeId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                   (resource.data == null || resource.data.userId == request.auth.uid) && 
                   request.resource.data.userId == request.auth.uid;
    }
    
    // Allow users to read and write their own reports
    match /reports/{reportId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                   (resource.data == null || resource.data.userId == request.auth.uid) && 
                   request.resource.data.userId == request.auth.uid;
    }
    
    // Allow users to read and write their own statements
    match /statements/{statementId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                   (resource.data == null || resource.data.userId == request.auth.uid) && 
                   request.resource.data.userId == request.auth.uid;
    }
  }
}
`

/**
 * 5. Firebase Storage Rules
 *
 * Copy and paste these rules in the Firebase Console > Storage > Rules
 */
const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all users
    match /{allPaths=**} {
      allow read;
    }
    
    // Allow authenticated users to write to their own user directory
    match /users/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to write to their own statements directory
    match /statements/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to write to exports directory
    match /exports/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to write to finsave-statements directory
    match /finsave-statements/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to write to csv-files directory
    match /csv-files/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to write to reports directory
    match /reports/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`

/**
 * 6. Environment Variables
 *
 * Create a .env.local file in the root of your project with the following variables:
 *
 * # Firebase Client SDK (Public)
 * NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
 * NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
 * NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
 *
 * # Firebase Admin SDK (Private)
 * FIREBASE_PROJECT_ID=your-project-id
 * FIREBASE_CLIENT_EMAIL=your-client-email
 * FIREBASE_PRIVATE_KEY="your-private-key"
 */

/**
 * 7. Firebase Admin SDK Setup
 *
 * - Go to Firebase Console > Project Settings > Service Accounts
 * - Generate a new private key
 * - Save the JSON file securely
 * - Use the values from the JSON file to set the FIREBASE_* environment variables
 */

/**
 * 8. Dependencies
 *
 * Make sure to install the following npm packages:
 * - firebase
 * - firebase-admin
 * - jspdf
 * - jspdf-autotable
 * - recharts
 */

// This file is for documentation purposes only
export {}
