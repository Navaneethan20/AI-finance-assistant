"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, AlertCircle, CheckCircle, ArrowLeft, FileType } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useFirebaseStorage } from "@/hooks/use-firebase-storage"
import { motion } from "framer-motion"
import { CustomLoader } from "@/components/ui/custom-loader"

export default function UploadStatementPage() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processingResults, setProcessingResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { uploadFile, isUploading, uploadProgress } = useFirebaseStorage({ path: "statements" })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check if file is CSV or PDF
      const fileType = selectedFile.type
      const fileName = selectedFile.name.toLowerCase()

      if (
        !(
          fileType === "text/csv" ||
          fileName.endsWith(".csv") ||
          fileType === "application/pdf" ||
          fileName.endsWith(".pdf")
        )
      ) {
        setError("Please upload a CSV or PDF file")
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
      setError(null)
      setSuccess(null)
      setProcessingResults(null)

      // Upload file to Firebase Storage
      const downloadURL = await uploadFile(file)

      if (!downloadURL) {
        throw new Error("Failed to upload file")
      }

      // Create form data for API request
      const formData = new FormData()
      formData.append("file", file)
      formData.append("user_id", user.uid)
      formData.append("file_url", downloadURL)

      // Send to statement processing API
      const response = await fetch("https://csv-convert-api.onrender.com/process-statement", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to process statement")
      }

      const result = await response.json()
      setProcessingResults(result)

      if (result.success) {
        setSuccess(`Statement processed successfully! Found ${result.transactions?.length || 0} transactions.`)
        setTimeout(() => {
          router.push("/transactions")
        }, 3000)
      } else {
        throw new Error(result.message || "Failed to process statement")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
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
            <p className="text-muted-foreground">Import your transactions by uploading a bank statement file</p>
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
                  Upload your bank statement in CSV or PDF format to automatically import your transactions
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
                      {file?.type === "application/pdf" || file?.name.toLowerCase().endsWith(".pdf") ? (
                        <FileType className="h-6 w-6 text-primary" />
                      ) : (
                        <FileText className="h-6 w-6 text-primary" />
                      )}
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
                      <p className="text-sm text-muted-foreground mt-1">CSV or PDF files only (max 10MB)</p>
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
                    accept=".csv,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                </div>

                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-center justify-center">
                      <CustomLoader
                        type="sparkles"
                        text={`Uploading and processing your statement (${Math.round(uploadProgress)}%)`}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Uploading...</span>
                        <span className="text-primary font-medium">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-primary h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-md flex flex-col items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <CheckCircle className="h-8 w-8" />
                    </motion.div>
                    <p className="text-center">{success}</p>
                    <div className="w-full bg-green-200 dark:bg-green-700/20 rounded-full h-1 mt-2">
                      <motion.div
                        className="bg-green-500 h-1 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                      ></motion.div>
                    </div>
                    <p className="text-xs">Redirecting to transactions page...</p>
                  </motion.div>
                )}

                {processingResults && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Processing Results</h4>
                    <div className="space-y-2 text-sm">
                      <p>Total Transactions: {processingResults.transactions?.length || 0}</p>
                      <p>Expenses: {processingResults.stats?.expenses_count || 0}</p>
                      <p>Income: {processingResults.stats?.income_count || 0}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <CustomLoader type="wave" size="sm" />
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
                <CardTitle>Supported File Formats</CardTitle>
                <CardDescription>We support the following file formats and bank statements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">CSV Files</h3>
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
                            <td className="py-2 px-4 text-muted-foreground">Transaction date</td>
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
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">PDF Files</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      We can extract transactions from PDF bank statements. For best results:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Use official bank statements (not screenshots)</li>
                      <li>Ensure the PDF is not password protected</li>
                      <li>Make sure the PDF contains transaction details in a tabular format</li>
                      <li>Text in the PDF should be selectable (not scanned images)</li>
                    </ul>
                  </div>
                </div>
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
