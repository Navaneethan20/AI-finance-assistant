// Firebase Storage Rules
// Copy these rules to your Firebase Storage Rules in the Firebase Console

/*
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
  }
}
*/

// Firebase Firestore Rules
// Copy these rules to your Firebase Firestore Rules in the Firebase Console

/*
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
    
    // Allow users to read and write their own statements
    match /statements/{statementId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                   (resource.data == null || resource.data.userId == request.auth.uid) && 
                   request.resource.data.userId == request.auth.uid;
    }
    
    // Allow users to read and write their own budget data
    match /budget/{budgetId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                   (resource.data == null || resource.data.userId == request.auth.uid) && 
                   request.resource.data.userId == request.auth.uid;
    }
    
    // Allow users to read and write their own goals
    match /goals/{goalId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                   (resource.data == null || resource.data.userId == request.auth.uid) && 
                   request.resource.data.userId == request.auth.uid;
    }
  }
}
*/

// This file is for documentation purposes only
// You need to copy these rules to your Firebase Console
export {}
