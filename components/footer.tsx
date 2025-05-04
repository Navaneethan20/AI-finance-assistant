import Link from "next/link"
import { Logo } from "@/components/logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              NIDZO helps you manage your personal finances with ease, providing insights and tools to achieve your
              financial goals.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/features/expense-tracking"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Expense Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/features/budget-planning"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Budget Planning
                </Link>
              </li>
              <li>
                <Link
                  href="/features/reports"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Financial Reports
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">&copy; {currentYear} NIDZO. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </Link>
            <Link href="https://facebook.com" className="text-muted-foreground hover:text-foreground transition-colors">
              Facebook
            </Link>
            <Link
              href="https://instagram.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Instagram
            </Link>
            <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
