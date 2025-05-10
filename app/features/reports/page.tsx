import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and view detailed reports of your financial activity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reports Coming Soon</CardTitle>
            <CardDescription>
              We're working on building comprehensive financial reports for you. Check back soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Our upcoming reports feature will allow you to generate detailed financial reports, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Monthly spending summaries</li>
              <li>Category-based expense analysis</li>
              <li>Income vs. expense comparisons</li>
              <li>Savings rate tracking</li>
              <li>Year-end tax reports</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
