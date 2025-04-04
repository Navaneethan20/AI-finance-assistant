import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SetupGuide() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="text-4xl font-bold mb-8">Firebase Setup Guide for Finsave</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Follow this comprehensive guide to set up Firebase for your Finsave application.
        </p>

        <Tabs defaultValue="authentication">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="functions">Cloud Functions</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Setup</CardTitle>
                <CardDescription>Configure Firebase Authentication for user management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 1: Enable Authentication Methods</h3>
                  <p>In the Firebase Console, navigate to Authentication → Sign-in method and enable:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email/Password</li>
                    <li>Google Sign-In</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 2: Configure Google Sign-In</h3>
                  <p>For Google Sign-In, you'll need to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Add your domain to the authorized domains list</li>
                    <li>Configure OAuth consent screen in Google Cloud Console</li>
                    <li>Add authorized JavaScript origins and redirect URIs</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 3: Set Up Authentication in Your App</h3>
                  <p>Ensure your Firebase config includes the necessary authentication details:</p>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Other config properties
};`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Firestore Database Setup</CardTitle>
                <CardDescription>Configure Firestore Database for data storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 1: Create Firestore Database</h3>
                  <p>In the Firebase Console, navigate to Firestore Database and create a new database:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Choose a location closest to your users</li>
                    <li>Start in production mode (or test mode for development)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 2: Set Up Collections</h3>
                  <p>Create the following collections for Finsave:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>users</strong> - User profiles and settings
                    </li>
                    <li>
                      <strong>expenses</strong> - Individual expense records
                    </li>
                    <li>
                      <strong>income</strong> - Income records
                    </li>
                    <li>
                      <strong>statements</strong> - Uploaded financial statements
                    </li>
                    <li>
                      <strong>budgets</strong> - Budget configurations
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 3: Set Up Security Rules</h3>
                  <p>Configure Firestore security rules to protect your data:</p>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Expenses can only be accessed by their owners
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Similar rules for other collections
    match /income/{incomeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /statements/{statementId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Firebase Storage Setup</CardTitle>
                <CardDescription>Configure Firebase Storage for file uploads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 1: Create Storage Bucket</h3>
                  <p>In the Firebase Console, navigate to Storage and create a new storage bucket:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Choose a location closest to your users</li>
                    <li>Configure public access settings (usually block public access)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 2: Set Up Folder Structure</h3>
                  <p>Organize your storage with the following folder structure:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>/profile-pictures/</strong> - User profile images
                    </li>
                    <li>
                      <strong>/statements/</strong> - Uploaded financial statements
                    </li>
                    <li>
                      <strong>/receipts/</strong> - Expense receipts and attachments
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 3: Set Up Security Rules</h3>
                  <p>Configure Storage security rules to protect your files:</p>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures can be read by anyone but only written by the owner
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Statements can only be accessed by their owners
    match /statements/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Receipts can only be accessed by their owners
    match /receipts/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="functions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cloud Functions Setup</CardTitle>
                <CardDescription>Configure Firebase Cloud Functions for serverless operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 1: Set Up Firebase CLI</h3>
                  <p>Install and configure the Firebase CLI:</p>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init functions`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 2: Create Cloud Functions</h3>
                  <p>Create the following Cloud Functions for Finsave:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>processStatement</strong> - Process uploaded financial statements
                    </li>
                    <li>
                      <strong>generateReport</strong> - Generate financial reports
                    </li>
                    <li>
                      <strong>categorizeTransaction</strong> - Automatically categorize transactions
                    </li>
                    <li>
                      <strong>userCreated</strong> - Handle new user creation
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 3: Deploy Cloud Functions</h3>
                  <p>Deploy your Cloud Functions to Firebase:</p>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`# Deploy all functions
firebase deploy --only functions

# Deploy a specific function
firebase deploy --only functions:processStatement`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Example: Statement Processing Function</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.processStatement = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const fileName = filePath.split('/').pop();
  
  // Check if this is a statement file
  if (!filePath.startsWith('statements/')) {
    return null;
  }
  
  // Extract user ID from path
  const userId = filePath.split('/')[1];
  
  // Process the statement (this would use your AI model in production)
  const transactions = await extractTransactionsFromStatement(object);
  
  // Save extracted transactions to Firestore
  const batch = admin.firestore().batch();
  
  for (const transaction of transactions) {
    const collectionRef = transaction.type === 'expense' 
      ? admin.firestore().collection('expenses')
      : admin.firestore().collection('income');
      
    const docRef = collectionRef.doc();
    batch.set(docRef, {
      ...transaction,
      userId,
      statementId: fileName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'statement',
    });
  }
  
  // Update statement status
  const statementRef = admin.firestore().collection('statements').doc(fileName);
  batch.update(statementRef, {
    status: 'processed',
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    transactionCount: transactions.length,
  });
  
  return batch.commit();
});`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

