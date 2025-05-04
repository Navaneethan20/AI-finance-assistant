"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

export function QuickActionButtons() {
  return (
    <div className="flex items-center gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
        <Link href="/add-expense">
          <Button
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            <ArrowDownRight className="mr-1 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
        <Link href="/add-income">
          <Button
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            <ArrowUpRight className="mr-1 h-4 w-4" />
            Add Income
          </Button>
        </Link>
      </motion.div>

      {/* Mobile view - single add button */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/add-expense" className="flex items-center">
                <ArrowDownRight className="mr-2 h-4 w-4 text-red-500" />
                Add Expense
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/add-income" className="flex items-center">
                <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
                Add Income
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* More actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/upload-statement">Upload Statement</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/reports">Generate Report</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/budget-insights">View Insights</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
