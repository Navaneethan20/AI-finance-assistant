import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Receipt, BarChart, PieChart, FileText, Upload } from "lucide-react"

export default function ExpenseTrackingPage() {
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
                  Expense Tracking
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Effortless Expense Tracking for Complete Financial Control
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Track every rupee with our intuitive expense tracking tools. Categorize, analyze, and understand your
                  spending habits with ease.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative lg:pl-10">
                <div className="relative mx-auto aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-2 shadow-lg md:p-8 animate-float">
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-lg"></div>
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-primary">Expense Summary</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Food & Dining</span>
                        <span className="text-sm font-medium">₹12,500</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: "45%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Transportation</span>
                        <span className="text-sm font-medium">₹5,200</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: "25%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Entertainment</span>
                        <span className="text-sm font-medium">₹3,800</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-green-500" style={{ width: "15%" }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 rounded-md bg-primary/20 p-3 flex flex-col justify-between">
                        <div className="text-xs text-primary/70">Total Expenses</div>
                        <div className="text-lg font-semibold text-primary">₹21,500</div>
                      </div>
                      <div className="h-20 rounded-md bg-primary/20 p-3 flex flex-col justify-between">
                        <div className="text-xs text-primary/70">Monthly Trend</div>
                        <div className="text-lg font-semibold text-green-500">-5% vs Last Month</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/10 animate-pulse-slow"></div>
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
                <CardHeader className="p-0 pb-4">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Automatic Categorization</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-muted-foreground">
                    Our AI automatically categorizes your expenses, saving you time and providing accurate insights into
                    your spending habits.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="p-0 pb-4">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Visual Analytics</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-muted-foreground">
                    See your spending patterns with beautiful charts and graphs that make it easy to understand where
                    your money is going.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="p-0 pb-4">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Statement Import</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-muted-foreground">
                    Easily import bank and credit card statements to automatically track all your transactions without
                    manual entry.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mt-4 text-muted-foreground md:text-xl">Track your expenses in three simple steps</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Connect Your Accounts</h3>
                <p className="text-muted-foreground">
                  Link your bank accounts or upload statements to automatically import transactions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Categorize Expenses</h3>
                <p className="text-muted-foreground">
                  Our AI automatically categorizes your expenses, or you can manually adjust them as needed.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Gain Insights</h3>
                <p className="text-muted-foreground">
                  View detailed reports and analytics to understand your spending habits and make better financial
                  decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why Track Your Expenses?</h2>
                <p className="text-muted-foreground">
                  Understanding where your money goes is the first step to financial freedom. Our expense tracking tools
                  help you:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Identify unnecessary spending and cut costs</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Stay within your budget and avoid overspending</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Plan for future expenses with confidence</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Make informed financial decisions based on data</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Achieve your savings goals faster</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
                  <PieChart className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Category Analysis</h3>
                  <p className="text-muted-foreground">
                    See exactly where your money is going with detailed category breakdowns.
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
                  <BarChart className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Spending Trends</h3>
                  <p className="text-muted-foreground">
                    Track how your spending changes over time to identify patterns.
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
                  <Receipt className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Receipt Scanning</h3>
                  <p className="text-muted-foreground">
                    Capture receipts with your camera for quick and easy expense tracking.
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
                  <FileText className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Expense Reports</h3>
                  <p className="text-muted-foreground">Generate detailed reports for personal or business use.</p>
                </div>
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
                  Ready to Take Control of Your Expenses?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join thousands of users who are already tracking their expenses smarter with Finsave.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg">Get Started for Free</Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    View Demo
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
