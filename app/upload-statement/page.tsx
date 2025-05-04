"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { uploadFile } from "@/hooks/use-firebase-storage"
import { processCSV } from "@/lib/consolidated-csv-service"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { motion } from "framer-motion"

export default function UploadStatementPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a CSV file")
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    if (!user) {
      setError("You must be logged in to upload a statement")
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      setSuccess(null)

      // Upload file to Firebase Storage
      const uploadPath = `statements/${user.uid}/${file.name}`
      const downloadURL = await uploadFile(file, uploadPath, (progress) => setUploadProgress(progress))

      if (!downloadURL) {
        throw new Error("Failed to upload file")
      }

      // Process the CSV file
      const result = await processCSV(file, user.uid)

      if (result.success) {
        setSuccess("Statement uploaded and processed successfully!")
        setTimeout(() => {
          router.push("/transactions")
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to process CSV file")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setFile(null)
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Bank Statement</h1>
            <p className="text-muted-foreground">Import your transactions by uploading a bank statement CSV file</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Statement
                </CardTitle>
                <CardDescription>
                  Upload your bank statement in CSV format to automatically import your transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 p-6",
                    file
                      ? "border-primary/50 bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50",
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">
                        {file ? (
                          <span className="text-primary">{file.name}</span>
                        ) : (
                          <span>
                            <span className="text-primary font-semibold">Click to upload</span> or drag and drop
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">CSV files only (max 10MB)</p>
                    </div>
                    {file && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle className="h-4 w-4" />
                        File selected
                      </div>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Uploading...</span>
                      <span className="text-primary font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-md text-sm">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload & Process
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>CSV Format Guidelines</CardTitle>
                <CardDescription>For the best results, ensure your CSV file has the following columns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left font-medium text-muted-foreground">Column</th>
                        <th className="py-2 px-4 text-left font-medium text-muted-foreground">Description</th>
                        <th className="py-2 px-4 text-left font-medium text-muted-foreground">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 px-4 font-medium">Date</td>
                        <td className="py-2 px-4 text-muted-foreground">Transaction date (DD/MM/YYYY)</td>
                        <td className="py-2 px-4 text-muted-foreground">15/04/2023</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-medium">Description</td>
                        <td className="py-2 px-4 text-muted-foreground">Transaction description</td>
                        <td className="py-2 px-4 text-muted-foreground">Grocery Shopping</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-medium">Amount</td>
                        <td className="py-2 px-4 text-muted-foreground">Transaction amount</td>
                        <td className="py-2 px-4 text-muted-foreground">2500.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-medium">Type</td>
                        <td className="py-2 px-4 text-muted-foreground">Credit or Debit</td>
                        <td className="py-2 px-4 text-muted-foreground">Debit</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-medium">Category</td>
                        <td className="py-2 px-4 text-muted-foreground">Transaction category (optional)</td>
                        <td className="py-2 px-4 text-muted-foreground">Groceries</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Note: If your CSV doesn't match this format exactly, our system will attempt to map the columns
                  automatically.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Supported Banks:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak", "Yes Bank", "PNB", "Bank of Baroda"].map(
              (bank) => (
                <div key={bank} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm text-center">
                  {bank}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
