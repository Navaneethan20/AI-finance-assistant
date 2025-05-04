"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Choose the plan that's right for you and start taking control of your finances today.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-card border rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium">Free</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">₹0</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Perfect for individuals just starting out.</p>
                </div>
                <div className="border-t p-6 space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Basic expense tracking</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Up to 50 transactions per month</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Simple budget planning</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Basic reports</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t p-6">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-card border rounded-xl shadow-sm overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Popular
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium">Premium</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">₹499</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">For individuals who want more advanced features.</p>
                </div>
                <div className="border-t p-6 space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Everything in Free</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Unlimited transactions</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Advanced budget planning</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>AI-powered insights</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Detailed reports and analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>CSV/PDF export</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t p-6">
                  <Link href="/register">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </motion.div>

              {/* Business Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card border rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium">Business</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">₹1,999</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">For businesses and teams with advanced needs.</p>
                </div>
                <div className="border-t p-6 space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Everything in Premium</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Team collaboration</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Role-based permissions</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Advanced tax reporting</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>API access</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Dedicated support</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t p-6">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Have questions about our pricing? Find answers to common questions below.
              </p>
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Can I switch plans later?</h3>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next
                  billing cycle.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Do you offer annual billing?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer annual billing with a 20% discount compared to monthly billing.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer a 14-day free trial for our Premium and Business plans. No credit card required.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, debit cards, UPI, and net banking.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Can I cancel my subscription?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of
                  your billing period.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our
                  support team.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Take Control of Your Finances?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join thousands of users who are already managing their finances smarter with NIDZO.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg">Get Started for Free</Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
