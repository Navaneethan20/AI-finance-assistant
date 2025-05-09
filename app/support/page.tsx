"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { MessageSquare, FileText, HelpCircle, Search, Send, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SupportPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast({
        title: "Search initiated",
        description: `Searching for "${searchQuery}"`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    })

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    }, 3000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How Can We Help You?</h1>
              <p className="text-muted-foreground md:text-xl">
                Find answers, get support, and share your feedback with our team.
              </p>
              <div className="relative max-w-xl mx-auto mt-6">
                <form onSubmit={handleSearch}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for help articles..."
                    className="pl-10 h-12 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-10"
                  >
                    Search
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="help" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="help">Help Center</TabsTrigger>
                <TabsTrigger value="contact">Contact Us</TabsTrigger>
                <TabsTrigger value="faq">FAQs</TabsTrigger>
              </TabsList>
              <TabsContent value="help">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <FileText className="h-6 w-6" />
                        </div>
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>Learn the basics of using NIDZO</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="text-primary hover:underline">
                            <Link href="#">How to create an account</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">Setting up your profile</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">Adding your first transaction</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">Creating your first budget</Link>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <HelpCircle className="h-6 w-6" />
                        </div>
                        <CardTitle>Troubleshooting</CardTitle>
                        <CardDescription>Solve common issues</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="text-primary hover:underline">
                            <Link href="#">Login problems</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">Syncing issues</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">Missing transactions</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">Report generation errors</Link>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <CardTitle>Community</CardTitle>
                        <CardDescription>Connect with other users</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="text-primary hover:underline">
                            <Link href="#">Join our forum</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">User tips and tricks</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">Feature requests</Link>
                          </li>
                          <li className="text-primary hover:underline">
                            <Link href="#">Success stories</Link>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <div className="mt-12 text-center">
                  <h3 className="text-xl font-bold mb-4">Popular Help Articles</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="#" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      How to import transactions from your bank
                    </Link>
                    <Link href="#" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      Setting up recurring transactions
                    </Link>
                    <Link href="#" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      Understanding budget insights
                    </Link>
                    <Link href="#" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      Generating financial reports
                    </Link>
                    <Link href="#" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      Managing multiple accounts
                    </Link>
                    <Link href="#" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      Setting up budget alerts
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Our Support Team</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submitted ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground">
                          Thank you for contacting us. We'll get back to you as soon as possible.
                        </p>
                      </div>
                    ) : (
                      <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                              Name
                            </label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Your name"
                              value={contactForm.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                              Email
                            </label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="Your email"
                              value={contactForm.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-sm font-medium">
                            Subject
                          </label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="How can we help you?"
                            value={contactForm.subject}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="message" className="text-sm font-medium">
                            Message
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Please describe your issue or question in detail"
                            value={contactForm.message}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full md:w-auto flex items-center gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span>Submit</span>
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find answers to common questions about NIDZO</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">How do I connect my bank account?</h3>
                      <p className="text-sm text-muted-foreground">
                        NIDZO uses secure bank connections through our trusted partners. Go to Settings &gt; Linked
                        Accounts and follow the prompts to connect your bank securely.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Is my financial data secure?</h3>
                      <p className="text-sm text-muted-foreground">
                        Yes, we use bank-level encryption and security measures to protect your data. We never store
                        your bank credentials and use tokenized access for account connections.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">How do I cancel my subscription?</h3>
                      <p className="text-sm text-muted-foreground">
                        You can cancel your subscription at any time by going to Settings &gt; Subscription and clicking
                        on "Cancel Subscription". Your access will continue until the end of your billing period.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Can I export my financial data?</h3>
                      <p className="text-sm text-muted-foreground">
                        Yes, you can export your data in CSV or PDF format from the Reports section. This allows you to
                        keep records or use your data in other applications.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">How do I set up budget categories?</h3>
                      <p className="text-sm text-muted-foreground">
                        Go to Budget &gt; Categories to set up and customize your budget categories. You can create new
                        categories, edit existing ones, or use our recommended default categories.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  )
}
