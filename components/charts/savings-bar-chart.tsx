"use client"

import { useRef } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SavingsBarChartProps {
  data: {
    month: string
    projected: number
    actual: number
  }[]
}

export function SavingsBarChart({ data }: SavingsBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={chartRef} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
            </linearGradient>
            <filter id="shadow" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.1" />
            </filter>
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
            formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              padding: "10px",
            }}
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          />
          <Legend wrapperStyle={{ paddingTop: "15px" }} iconType="circle" />
          <Bar
            dataKey="projected"
            name="Projected Savings"
            radius={[4, 4, 0, 0]}
            fill="url(#projectedGradient)"
            filter="url(#shadow)"
            barSize={20}
          />
          <Bar
            dataKey="actual"
            name="Actual Savings"
            radius={[4, 4, 0, 0]}
            fill="url(#actualGradient)"
            filter="url(#shadow)"
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
