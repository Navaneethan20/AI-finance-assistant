import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Target, TrendingUp, AlertCircle, BarChart, PieChart } from "lucide-react"

export default function BudgetPlanningPage() {
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
                  Budget Planning
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Smart Budget Planning for Financial Success
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Create personalized budgets, set realistic goals, and stay on track with our intelligent budget
                  planning tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Create Your Budget
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
                          <Target className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-primary">Budget Overview</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Housing</span>
                        <span className="text-sm font-medium">₹15,000 / ₹18,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-green-500" style={{ width: "83%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Food & Dining</span>
                        <span className="text-sm font-medium">₹12,500 / ₹10,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-red-500" style={{ width: "125%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Transportation</span>
                        <span className="text-sm font-medium">₹4,200 / ₹5,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-green-500" style={{ width: "84%" }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 rounded-md bg-primary/20 p-3 flex flex-col justify-between">
                        <div className="text-xs text-primary/70">Total Budget</div>
                        <div className="text-lg font-semibold text-primary">₹45,000</div>
                      </div>
                      <div className="h-20 rounded-md bg-primary/20 p-3 flex flex-col justify-between">
                        <div className="text-xs text-primary/70">Remaining</div>
                        <div className="text-lg font-semibold text-green-500">₹13,300</div>
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
                Everything you need to plan and manage your budget effectively
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="p-0 pb-4">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Smart Budget Creation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-muted-foreground">
                    Our AI analyzes your spending patterns and income to suggest realistic budgets tailored to your
                    financial situation.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="p-0 pb-4">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Budget Alerts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-muted-foreground">
                    Receive timely notifications when you're approaching or exceeding your budget limits to help you
                    stay on track.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="p-0 pb-4">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Budget vs. Actual</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-muted-foreground">
                    Compare your planned budget with actual spending to identify areas where you can improve and adjust
                    your financial plans.
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
              <p className="mt-4 text-muted-foreground md:text-xl">
                Create and manage your budget in three simple steps
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Analyze Your Finances</h3>
                <p className="text-muted-foreground">
                  Our system analyzes your income and spending patterns to understand your financial situation.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Create Your Budget</h3>
                <p className="text-muted-foreground">
                  Set budget limits for different categories based on your income and financial goals.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Track & Adjust</h3>
                <p className="text-muted-foreground">
                  Monitor your progress, receive alerts, and adjust your budget as needed to stay on track.
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why Budget Planning Matters</h2>
                <p className="text-muted-foreground">
                  A well-planned budget is the foundation of financial success. Our budget planning tools help you:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Take control of your finances and reduce financial stress</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Prioritize spending on what matters most to you</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Build emergency funds and save for future goals</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Reduce debt and improve your financial health</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>Make informed decisions about major purchases</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
                  <PieChart className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Budget Templates</h3>
                  <p className="text-muted-foreground">
                    Choose from various budget templates designed for different financial situations and goals.
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
                  <BarChart className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Performance Tracking</h3>
                  <p className="text-muted-foreground">
                    Track your budget performance over time with detailed analytics and insights.
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
                  <Target className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Goal Setting</h3>
                  <p className="text-muted-foreground">
                    Set financial goals and track your progress towards achieving them.
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
                  <TrendingUp className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Scenario Planning</h3>
                  <p className="text-muted-foreground">
                    Create different budget scenarios to prepare for various financial situations.
                  </p>
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
                  Ready to Take Control of Your Budget?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join thousands of users who are already planning their finances smarter with Finsave.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg">Create Your Budget</Button>
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
