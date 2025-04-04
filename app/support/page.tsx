import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowRight, FileText, HelpCircle, Mail, MessageSquare, Phone } from "lucide-react"

export default function Support() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How Can We Help You?</h1>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Get the support you need to make the most of Finsave
              </p>
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <CardTitle>Help Center</CardTitle>
                  <CardDescription>Browse our knowledge base for answers to common questions</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground mb-4">
                    Find step-by-step guides, tutorials, and answers to frequently asked questions.
                  </p>
                  <Link href="/help-center">
                    <Button variant="outline" className="w-full group">
                      Browse Help Center
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <CardTitle>Live Chat</CardTitle>
                  <CardDescription>Chat with our support team in real-time</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground mb-4">
                    Get immediate assistance from our friendly support team through live chat.
                  </p>
                  <Button className="w-full">Start Chat</Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <CardTitle>Email Support</CardTitle>
                  <CardDescription>Send us an email and we'll get back to you</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground mb-4">
                    For non-urgent issues, send us an email and we'll respond within 24 hours.
                  </p>
                  <Link href="mailto:support@finsave.com">
                    <Button variant="outline" className="w-full">
                      support@finsave.com
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">Get in Touch</h2>
                <p className="text-muted-foreground mb-6">
                  Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">support@finsave.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-muted-foreground">+91 1234567890</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Documentation</h3>
                      <p className="text-muted-foreground">View our documentation</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea id="message" placeholder="Your message" rows={5} />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-4 text-muted-foreground">Find quick answers to common questions</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">How do I reset my password?</h3>
                <p className="text-muted-foreground">
                  You can reset your password by clicking on the "Forgot Password" link on the login page. You'll
                  receive an email with instructions to reset your password.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">How do I upload my bank statement?</h3>
                <p className="text-muted-foreground">
                  After logging in, navigate to the "Upload Statement" page from the sidebar. You can then drag and drop
                  your statement file or click to browse and select it.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Is my financial data secure?</h3>
                <p className="text-muted-foreground">
                  Yes, we take security very seriously. All your data is encrypted and stored securely. We never share
                  your financial information with third parties without your consent.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Can I export my financial reports?</h3>
                <p className="text-muted-foreground">
                  Yes, you can export your financial reports in PDF or CSV format. Simply go to the Reports page,
                  generate the report you need, and click on the export button.
                </p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <Link href="/faq">
                <Button variant="outline" size="lg">
                  View All FAQs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

