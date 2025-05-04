"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SpendingTrendChartProps {
  data: {
    date: string
    amount: number
  }[]
  title?: string
  description?: string
}

export function SpendingTrendChart({
  data,
  title = "Spending Trend",
  description = "Your spending over time",
}: SpendingTrendChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Format dates for display
    const formattedDates = sortedData.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    })

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: formattedDates,
        datasets: [
          {
            label: "Spending",
            data: sortedData.map((item) => item.amount),
            borderColor: "hsl(var(--primary))",
            backgroundColor: "rgba(0, 102, 255, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "hsl(var(--primary))",
            pointBorderColor: "#fff",
            pointBorderWidth: 1,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => "₹" + value.toLocaleString(),
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || ""
                const value = context.raw as number
                return `${label}: ₹${value.toLocaleString()}`
              },
            },
          },
        },
      },
    })

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] relative">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
