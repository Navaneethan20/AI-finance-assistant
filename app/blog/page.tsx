import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Better Financial Management",
    description: "Learn how to manage your finances more effectively with these practical tips.",
    category: "Personal Finance",
    date: "March 15, 2023",
    readTime: "5 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "Understanding Investment Basics",
    description: "A beginner's guide to understanding different investment options and strategies.",
    category: "Investing",
    date: "April 2, 2023",
    readTime: "8 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "How to Create a Budget That Works",
    description: "Step-by-step guide to creating a budget that you can actually stick to.",
    category: "Budgeting",
    date: "April 18, 2023",
    readTime: "6 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    title: "Saving for Retirement: Start Early",
    description: "Why starting early is crucial for retirement savings and how to get started.",
    category: "Retirement",
    date: "May 5, 2023",
    readTime: "7 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    title: "Debt Management Strategies",
    description: "Effective strategies to manage and reduce your debt faster.",
    category: "Debt Management",
    date: "May 22, 2023",
    readTime: "9 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 6,
    title: "Understanding Credit Scores",
    description: "Everything you need to know about credit scores and how to improve yours.",
    category: "Credit",
    date: "June 10, 2023",
    readTime: "6 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
]

export default function Blog() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Finsave Blog</h1>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Insights, tips, and strategies to help you manage your finances better
              </p>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Featured blog post"
                  className="rounded-xl object-cover w-full h-[300px] md:h-[400px]"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Featured
                  </span>
                  <span className="text-sm text-muted-foreground">June 25, 2023</span>
                </div>
                <h2 className="text-3xl font-bold">The Ultimate Guide to Financial Freedom</h2>
                <p className="text-muted-foreground">
                  Discover the step-by-step process to achieve financial freedom and live the life you've always dreamed
                  of. This comprehensive guide covers everything from budgeting and saving to investing and passive
                  income.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">By Rahul Sharma</span>
                  <span className="text-sm text-muted-foreground">12 min read</span>
                </div>
                <Link href="/blog/financial-freedom">
                  <Button className="group">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Latest Articles</h2>
              <p className="mt-4 text-muted-foreground">Stay updated with our latest financial insights and tips</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Card key={post.id} className="flex flex-col overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-sm text-muted-foreground">{post.readTime}</div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/blog/${post.id}`} className="w-full">
                      <Button variant="outline" className="w-full group">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Subscribe to Our Newsletter</h2>
              <p className="text-muted-foreground">
                Get the latest financial tips and insights delivered directly to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button>Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

