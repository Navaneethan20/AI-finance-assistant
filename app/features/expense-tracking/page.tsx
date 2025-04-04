import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BarChart2, PieChart, Receipt, Upload } from "lucide-react"

export default function ExpenseTracking() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Finsave Feature
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Effortless Expense Tracking
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Track your expenses with ease and gain insights into your spending habits with our intelligent expense
                  tracking system.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="relative mx-auto aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-2 shadow-lg md:p-8 animate-float">
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-lg"></div>
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-24 rounded-md bg-primary/20"></div>
                      <div className="text-2xl font-bold text-primary">Expense Tracker</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded-md bg-primary/20"></div>
                      <div className="h-4 w-3/4 rounded-md bg-primary/20"></div>
                      <div className="h-4 w-1/2 rounded-md bg-primary/20"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 rounded-md bg-primary/20 p-3 flex flex-col justify-between">
                        <div className="text-xs text-primary/70">Monthly Expenses</div>
                        <div className="text-lg font-semibold text-primary">₹15,500</div>
                      </div>
                      <div className="h-20 rounded-md bg-primary/20 p-3 flex flex-col justify-between">
                        <div className="text-xs text-primary/70">Top Category</div>
                        <div className="text-lg font-semibold text-primary">Food & Dining</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Everything you need to track and manage your expenses effectively
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Manual Entry</h3>
                <p className="mt-2 text-muted-foreground">
                  Quickly add expenses with our intuitive form. Categorize and add notes for better tracking.
                </p>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Statement Upload</h3>
                <p className="mt-2 text-muted-foreground">
                  Upload bank statements and let our AI extract and categorize transactions automatically.
                </p>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Category Insights</h3>
                <p className="mt-2 text-muted-foreground">
                  See where your money goes with detailed category breakdowns and spending patterns.
                </p>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Trend Analysis</h3>
                <p className="mt-2 text-muted-foreground">
                  Track how your spending changes over time with interactive charts and visualizations.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Take Control of Your Expenses?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join thousands of users who are already tracking their expenses with Finsave.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg">Get Started for Free</Button>
                </Link>
                <Link href="/features/budget-planning">
                  <Button size="lg" variant="outline" className="group">
                    Explore Budget Planning
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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

