"use client"

import type React from "react"

import { useState, useRef } from "react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Upload, File } from "lucide-react"
import { StatusMessage } from "@/components/ui/status-message"
import { processStatement } from "@/lib/ai-service"

const statementTypes = ["Bank Statement", "Credit Card Statement", "Investment Statement", "Tax Statement", "Other"]

export default function UploadStatement() {
  const [file, setFile] = useState<File | null>(null)
  const [statementType, setStatementType] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError("")
      setIsComplete(false)
      setSuccessMessage("")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError("")
      setIsComplete(false)
      setSuccessMessage("")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    if (!statementType) {
      setError("Please select a statement type")
      return
    }

    if (!user) {
      setError("You must be logged in to upload a statement")
      return
    }

    try {
      setIsUploading(true)
      setError("")
      setSuccessMessage("")

      // Simulate upload progress
      const simulateProgress = () => {
        let progress = 0
        const interval = setInterval(() => {
          progress += 5
          setUploadProgress(progress)
          if (progress >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            setIsProcessing(true)

            // Simulate processing with AI
            setTimeout(async () => {
              try {
                // For preview, we'll use a mock function
                const statementId = Math.random().toString(36).substring(2, 15)
                const result = await processStatement(statementId, user.uid)

                setIsProcessing(false)
                setIsComplete(true)
                setSuccessMessage(
                  `Statement processed successfully! ${result.transactionCount} transactions extracted.`,
                )

                toast({
                  title: "Success",
                  description: `Statement processed with ${result.transactionCount} transactions extracted`,
                })
              } catch (error) {
                console.error("Error processing statement:", error)
                setError("Error processing statement. Please try again.")
                setIsProcessing(false)
              }
            }, 2000)
          }
        }, 100)
      }

      simulateProgress()
    } catch (error) {
      console.error("Upload error:", error)
      setError("Error uploading file. Please try again.")
      setIsUploading(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Statement</h1>
          <p className="text-muted-foreground">Upload your financial statements for AI-powered analysis</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Statement Upload</CardTitle>
            <CardDescription>
              Upload bank statements, credit card statements, or other financial documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="statementType">Statement Type</Label>
              <Select value={statementType} onValueChange={setStatementType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select statement type" />
                </SelectTrigger>
                <SelectContent>
                  {statementTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <div
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.csv,.xlsx,.xls"
                />

                {!file ? (
                  <div className="text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Drag and drop your file here, or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports PDF, CSV, Excel files up to 10MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <File className="h-10 w-10 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {isProcessing && (
              <div className="bg-primary/10 text-primary p-3 rounded-md flex items-center gap-2 animate-pulse">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm">Processing your statement with AI...</span>
              </div>
            )}

            {error && <StatusMessage type="error" message={error} onClose={() => setError("")} />}

            {successMessage && (
              <StatusMessage type="success" message={successMessage} onClose={() => setSuccessMessage("")} />
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpload}
              className="w-full"
              disabled={!file || !statementType || isUploading || isProcessing}
            >
              {isUploading ? "Uploading..." : isProcessing ? "Processing..." : "Upload Statement"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}

