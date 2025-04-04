import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function Home() {
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
                  Introducing Finsave
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI-Powered Finance Assistant for Your Financial Success
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Take control of your finances with intelligent insights, automated expense tracking, and personalized
                  recommendations.
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
              <div className="relative lg:pl-10">
                <div className="relative mx-auto aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-2 shadow-lg md:p-8 animate-float">
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-lg"></div>
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-4 w-4"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </div>
                        <span className="font-semibold text-primary">Financial Summary</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">₹24,500</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Income</span>
                        <span className="text-sm font-medium">₹45,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: "100%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Expenses</span>
                        <span className="text-sm font-medium">₹20,500</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: "45%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Savings Goal</span>
                        <span className="text-sm font-medium">₹15,000 / ₹25,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-green-500" style={{ width: "60%" }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 rounded-md bg-primary/20 p-3 flex flex-col justify-between">
                        <div className="text-xs text-primary/70">Monthly Savings</div>
                        <div className="text-lg font-semibold text-primary">₹5,500</div>
                      </div>
                      <div className="h-20 rounded-md bg-primary/20 p-3 flex flex-col justify-between">
                        <div className="text-xs text-primary/70">Budget Status</div>
                        <div className="text-lg font-semibold text-green-500">On Track</div>
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Everything you need to manage your finances effectively
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Expense Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  Easily track and categorize your expenses to understand your spending habits.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Budget Planning</h3>
                <p className="mt-2 text-muted-foreground">
                  Create and manage budgets to help you stay on track with your financial goals.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI Insights</h3>
                <p className="mt-2 text-muted-foreground">
                  Get personalized financial insights and recommendations powered by AI.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Join thousands of satisfied users who have transformed their financial lives
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  name: "Priya Sharma",
                  role: "Small Business Owner",
                  content:
                    "Finsave has completely changed how I manage my business finances. The AI insights have helped me identify areas where I can cut costs and increase profits.",
                },
                {
                  name: "Rahul Patel",
                  role: "Software Engineer",
                  content:
                    "I've tried many finance apps, but Finsave stands out with its intuitive interface and powerful features. The automatic categorization saves me hours every month.",
                },
                {
                  name: "Ananya Gupta",
                  role: "Freelance Designer",
                  content:
                    "As a freelancer, tracking my income and expenses was always a challenge. Finsave makes it simple and provides valuable insights that help me plan for taxes and savings.",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-card rounded-xl p-6 shadow-sm transition-all hover:shadow-md border">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 text-primary">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-lg">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="flex-1 text-muted-foreground mb-4">{testimonial.content}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  Join thousands of users who are already managing their finances smarter with Finsave.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg">Get Started for Free</Button>
                </Link>
                <Link href="#">
                  <Button size="lg" variant="outline">
                    Learn More
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

