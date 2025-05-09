"use client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

// Sample blog posts data with images
const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Better Financial Planning",
    excerpt: "Learn how to create a solid financial plan that helps you achieve your goals and secure your future.",
    date: "May 15, 2023",
    author: "Rahul Sharma",
    category: "Financial Planning",
    readTime: "5 min read",
    image: "/blog/financial-planning.png",
  },
  {
    id: 2,
    title: "Understanding Investment Options in India",
    excerpt:
      "A comprehensive guide to different investment options available in India and how to choose the right ones.",
    date: "April 28, 2023",
    author: "Priya Patel",
    category: "Investments",
    readTime: "8 min read",
    image: "/blog/investments.png",
  },
  {
    id: 3,
    title: "How to Create a Budget That Actually Works",
    excerpt:
      "Practical tips for creating a budget that you can stick to and that helps you achieve your financial goals.",
    date: "April 10, 2023",
    author: "Amit Kumar",
    category: "Budgeting",
    readTime: "6 min read",
    image: "/blog/budgeting.png",
  },
  {
    id: 4,
    title: "Tax Saving Strategies for Salaried Employees",
    excerpt:
      "Learn how to optimize your tax planning and save money with these effective strategies for salaried individuals.",
    date: "March 22, 2023",
    author: "Neha Gupta",
    category: "Taxation",
    readTime: "7 min read",
    image: "/blog/taxation.png",
  },
  {
    id: 5,
    title: "The Power of Compound Interest",
    excerpt: "Understand how compound interest works and how it can help you build wealth over time.",
    date: "March 5, 2023",
    author: "Vikram Singh",
    category: "Investments",
    readTime: "4 min read",
    image: "/blog/compound-interest.png",
  },
  {
    id: 6,
    title: "Emergency Fund: Why You Need One and How to Build It",
    excerpt: "Learn why having an emergency fund is crucial and how to build one that provides financial security.",
    date: "February 18, 2023",
    author: "Ananya Desai",
    category: "Savings",
    readTime: "5 min read",
    image: "/blog/emergency-fund.png",
  },
]

// Categories for filtering
const categories = ["All", "Financial Planning", "Investments", "Budgeting", "Taxation", "Savings"]

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">NIDZO Blog</h1>
              <p className="text-muted-foreground md:text-xl">
                Insights, tips, and strategies to help you manage your finances better.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((category) => (
                <Button key={category} variant={category === "All" ? "default" : "outline"} size="sm">
                  {category}
                </Button>
              ))}
            </div>

            {/* Featured Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <Card className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src="/blog/featured-post.png"
                      alt="Featured post"
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                    <div className="text-sm text-primary font-medium mb-2">Featured</div>
                    <h2 className="text-2xl font-bold mb-4">The Ultimate Guide to Personal Finance in 2023</h2>
                    <p className="text-muted-foreground mb-6">
                      A comprehensive guide to managing your personal finances in 2023, covering budgeting, saving,
                      investing, and planning for the future.
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground mb-6">
                      <span>May 20, 2023</span>
                      <span className="mx-2">•</span>
                      <span>Vikram Mehta</span>
                      <span className="mx-2">•</span>
                      <span>10 min read</span>
                    </div>
                    <Button>Read More</Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Blog Posts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col">
                    <div className="relative">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded">
                        {post.category}
                      </div>
                    </div>
                    <CardHeader className="flex-1">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-3 mt-2">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center border-t pt-4">
                      <div className="text-sm text-muted-foreground">
                        <span>{post.date}</span>
                        <span className="mx-1">•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Read More
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="default" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-2xl mx-auto">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">Subscribe to Our Newsletter</h2>
                <p className="text-muted-foreground">
                  Get the latest financial tips, insights, and updates delivered straight to your inbox.
                </p>
              </div>
              <div className="flex w-full max-w-md gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button>Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
