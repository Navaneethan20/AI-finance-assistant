import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BarChart2, FileText, PieChart, TrendingUp } from "lucide-react"

export default function Reports() {
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
                  Comprehensive Financial Reports
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Generate detailed financial reports to gain insights into your financial health and make informed
                  decisions.
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
                      <div className="text-2xl font-bold text-primary">Financial Report</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 rounded-md bg-primary/20 p-3 flex items-center justify-center">
                        <PieChart className="h-16 w-16 text-primary/70" />
                      </div>
                      <div className="h-32 rounded-md bg-primary/20 p-3 flex items-center justify-center">
                        <BarChart2 className="h-16 w-16 text-primary/70" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-4 w-full rounded-md bg-primary/20"></div>
                      <div className="h-4 w-3/4 rounded-md bg-primary/20"></div>
                      <div className="h-4 w-1/2 rounded-md bg-primary/20"></div>
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Report Types</h2>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Generate various types of reports to analyze different aspects of your finances
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Expense Summary</h3>
                <p className="mt-2 text-muted-foreground">
                  Get a detailed breakdown of your expenses by category, helping you identify where your money goes.
                </p>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Income vs Expense</h3>
                <p className="mt-2 text-muted-foreground">
                  Compare your income and expenses over time to understand your cash flow and financial health.
                </p>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Spending Trends</h3>
                <p className="mt-2 text-muted-foreground">
                  Analyze how your spending has changed over time and identify patterns in your financial behavior.
                </p>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Transaction History</h3>
                <p className="mt-2 text-muted-foreground">
                  Get a detailed list of all your transactions for a specific period, with filtering and sorting
                  options.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Export Options Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Export Options</h2>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Export your reports in various formats for easy sharing and analysis
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">PDF Format</h3>
                    <p className="text-muted-foreground">
                      Export professional-looking reports in PDF format for easy sharing and printing.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">CSV Format</h3>
                    <p className="text-muted-foreground">
                      Export your data in CSV format for further analysis in spreadsheet applications.
                    </p>
                  </div>
                </div>
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
                  Ready to Gain Financial Insights?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join thousands of users who are already using Finsave to generate insightful financial reports.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg">Get Started for Free</Button>
                </Link>
                <Link href="/features/expense-tracking">
                  <Button size="lg" variant="outline" className="group">
                    Explore Expense Tracking
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

