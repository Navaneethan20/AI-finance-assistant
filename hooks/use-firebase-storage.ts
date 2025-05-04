"use client"

import { useState, useEffect } from "react"
import { ref, uploadBytes, getDownloadURL, type StorageReference } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

interface UseFirebaseStorageProps {
  path?: string
}

interface UseFirebaseStorageReturn {
  uploadFile: (file: File) => Promise<string>
  isUploading: boolean
  error: Error | null
  storageRef: StorageReference | null
}

export function useFirebaseStorage({ path = "uploads" }: UseFirebaseStorageProps = {}): UseFirebaseStorageReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [storageRef, setStorageRef] = useState<StorageReference | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Create a reference to the user's storage path
      const userStorageRef = ref(storage, `${path}/${user.uid}`)
      setStorageRef(userStorageRef)
    } else {
      setStorageRef(null)
    }
  }, [user, path])

  const uploadFile = async (file: File): Promise<string> => {
    if (!storageRef) {
      throw new Error("Storage reference not initialized. User may not be authenticated.")
    }

    setIsUploading(true)
    setError(null)

    try {
      // Create a reference to the file in the user's storage
      const fileRef = ref(storageRef, `${Date.now()}-${file.name}`)

      // Upload the file
      const snapshot = await uploadBytes(fileRef, file)

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      return downloadURL
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadFile,
    isUploading,
    error,
    storageRef,
  }
}
