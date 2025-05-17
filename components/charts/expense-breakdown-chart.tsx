"use client"

import { useRef, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ExpenseBreakdownChartProps {
  data: {
    category: string
    amount: number
    color: string
  }[]
  title?: string
  description?: string
}

export function ExpenseBreakdownChart({
  data,
  title = "Expense Breakdown",
  description = "Your spending by category",
}: ExpenseBreakdownChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
        />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" fontSize={16} fontWeight="bold">
          {payload.category}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#fff" fontSize={14}>
          ₹{value.toLocaleString()}
        </text>
        <text x={cx} y={cy + 35} textAnchor="middle" fill="#fff" fontSize={12}>
          {(percent * 100).toFixed(0)}%
        </text>
      </g>
    )
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="col-span-1 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div
          className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-4 md:gap-8"
          ref={chartRef}
        >
          <div className="w-full md:w-[70%] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {data.map((entry, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`expense-gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#expense-gradient-${index})`}
                      stroke={entry.color}
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name, props) => {
                    const percentage = ((value / total) * 100).toFixed(1)
                    return [`₹${value.toLocaleString()} (${percentage}%)`, props.payload.category]
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    border: "none",
                    padding: "10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-[30%]">
            <Legend
              layout="vertical"
              verticalAlign="top"
              align="left"
              wrapperStyle={{
                fontSize: "12px",
              }}
              formatter={(value, entry) => {
                const { payload } = entry
                const percentage = ((payload.amount / total) * 100).toFixed(1)
                return (
                  <span style={{ color: "#333" }}>
                    {payload.category} ({percentage}%)
                  </span>
                )
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
