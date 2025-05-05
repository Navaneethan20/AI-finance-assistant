"use client"

import { useState, useEffect } from "react"
import { ref, uploadBytesResumable, getDownloadURL, type StorageReference } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

interface UseFirebaseStorageProps {
  path?: string
}

interface UseFirebaseStorageReturn {
  uploadFile: (file: File) => Promise<string>
  isUploading: boolean
  error: Error | null
  uploadProgress: number
  storageRef: StorageReference | null
}

export function useFirebaseStorage({ path = "uploads" }: UseFirebaseStorageProps = {}): UseFirebaseStorageReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
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
    setUploadProgress(0)

    try {
      // Create a reference to the file in the user's storage
      const fileRef = ref(storageRef, `${Date.now()}-${file.name}`)

      // Upload the file with progress tracking
      const uploadTask = uploadBytesResumable(fileRef, file)

      // Return a promise that resolves with the download URL
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setUploadProgress(progress)
          },
          (error) => {
            setError(error as Error)
            setIsUploading(false)
            reject(error)
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              setIsUploading(false)
              resolve(downloadURL)
            } catch (err) {
              setError(err as Error)
              setIsUploading(false)
              reject(err)
            }
          },
        )
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      setIsUploading(false)
      throw error
    }
  }

  return {
    uploadFile,
    isUploading,
    error,
    uploadProgress,
    storageRef,
  }
}
