"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"

// Import the cookie functions
import { setAuthCookie, removeAuthCookie } from "@/lib/auth-cookie"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<User>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      // If user is logged in, refresh the token and set the cookie
      if (user) {
        try {
          const token = await user.getIdToken(true)
          setAuthCookie(token)
        } catch (error) {
          console.error("Error refreshing token:", error)
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const refreshToken = async (): Promise<string | null> => {
    if (!user) return null

    try {
      const token = await user.getIdToken(true)
      setAuthCookie(token)
      return token
    } catch (error) {
      console.error("Error refreshing token:", error)
      return null
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      })

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        phone,
        createdAt: new Date().toISOString(),
        authProvider: "email",
      })

      // Set auth cookie
      const token = await user.getIdToken()
      setAuthCookie(token)
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // Set auth cookie
      const token = await userCredential.user.getIdToken()
      setAuthCookie(token)
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Set auth cookie
      const token = await user.getIdToken()
      setAuthCookie(token)

      // Check if this is a new user
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        // Create a new user document for Google users
        const nameParts = user.displayName?.split(" ") || ["", ""]
        await setDoc(doc(db, "users", user.uid), {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email || "",
          phone: "",
          photoURL: user.photoURL || "",
          createdAt: new Date().toISOString(),
          authProvider: "google",
        })
      }

      return user
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      // Remove auth cookie
      removeAuthCookie()
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        resetPassword,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
