"use client"

import { useRef } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"

interface SpendingLineChartProps {
  data: {
    month: string
    amount: number
  }[]
}

export function SpendingLineChart({ data }: SpendingLineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  // Add gradient for the area under the line
  const gradientId = "colorAmount"

  return (
    <div ref={chartRef} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} dy={10} />
          <YAxis
            tickFormatter={(value) => `₹${value / 1000}k`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#888", fontSize: 12 }}
            dx={-10}
          />
          <Tooltip
            formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              padding: "10px",
            }}
            labelStyle={{ fontWeight: "bold", marginBottom: "5px" }}
          />
          <Legend wrapperStyle={{ paddingTop: "15px" }} iconType="circle" />
          <Area
            type="monotone"
            dataKey="amount"
            name="Monthly Spending"
            stroke="#3b82f6"
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            activeDot={{
              r: 6,
              strokeWidth: 2,
              stroke: "#fff",
              fill: "#3b82f6",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
