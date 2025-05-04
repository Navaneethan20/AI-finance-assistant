"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { MessageSquare, FileText, HelpCircle, Search } from "lucide-react"

export default function SupportPage() {
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for help articles..."
                  className="pl-10 h-12 rounded-full"
                />
                <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-10">
                  Search
                </Button>
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
                    <Link href="#" className="p-4 bg-muted rounded-lg hover

\
