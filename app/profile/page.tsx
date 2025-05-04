"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { updateProfile as updateFirebaseProfile } from "firebase/auth"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { User, Camera } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { db, storage } from "@/lib/firebase"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  photoURL?: string
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile
          setProfile({
            ...userData,
            photoURL: user.photoURL || undefined,
          })
        } else {
          // If user document doesn't exist, create a default profile
          const nameParts = user.displayName?.split(" ") || ["", ""]
          setProfile({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: "",
            photoURL: user.photoURL || undefined,
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (!profile) return

    setProfile({
      ...profile,
      [name]: value,
    })
  }

  const handleSaveProfile = async () => {
    if (!user || !profile) return

    try {
      setIsSaving(true)

      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      })

      // Update Firebase Auth profile
      await updateFirebaseProfile(user, {
        displayName: `${profile.firstName} ${profile.lastName}`,
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]

    try {
      setIsUploading(true)

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `profile-pictures/${user.uid}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error("Upload error:", error)
          toast({
            title: "Error",
            description: "Failed to upload profile picture",
            variant: "destructive",
          })
          setIsUploading(false)
        },
        async () => {
          // Upload complete
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

            // Update Firebase Auth profile
            await updateFirebaseProfile(user, {
              photoURL: downloadURL,
            })

            // Update local state
            setProfile((prev) => (prev ? { ...prev, photoURL: downloadURL } : null))

            toast({
              title: "Success",
              description: "Profile picture updated successfully",
            })
          } catch (error) {
            console.error("Error updating profile picture:", error)
            toast({
              title: "Error",
              description: "Failed to update profile picture",
              variant: "destructive",
            })
          } finally {
            setIsUploading(false)
          }
        },
      )
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                      {profile?.photoURL ? (
                        <img
                          src={profile.photoURL || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <label
                      htmlFor="profile-picture"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change profile picture</span>
                      <Input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-lg font-medium">
                      {profile?.firstName} {profile?.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    {isUploading && (
                      <div className="text-xs text-muted-foreground">Uploading... {Math.round(uploadProgress)}%</div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profile?.firstName || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={profile?.lastName || ""} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={profile?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={profile?.phone || ""} onChange={handleInputChange} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Change Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Preference settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}
