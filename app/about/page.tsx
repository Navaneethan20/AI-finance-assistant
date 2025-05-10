import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container py-10 space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">About NIDZO</h1>
        <p className="text-xl text-muted-foreground">
          Empowering individuals to take control of their financial future
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              At NIDZO, we believe everyone deserves access to powerful financial tools. Our mission is to simplify
              personal finance management and help you achieve your financial goals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Founded in 2023, NIDZO was created by a team of finance experts and developers who saw the need for a more
              intuitive and comprehensive personal finance solution.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We're committed to transparency, security, and innovation. Your financial data is always protected, and
              we're constantly improving our platform to serve you better.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8">
        <Button asChild size="lg">
          <Link href="/register">Get Started Today</Link>
        </Button>
      </div>
    </div>
  )
}
