"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpCircle, ArrowDownCircle, MoreHorizontal, Upload, FileText } from "lucide-react"
import { motion } from "framer-motion"

export function QuickActionButtons() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
        <Link href="/add-expense">
          <Button
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            <ArrowDownCircle className="mr-1 h-4 w-4" />
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
            <ArrowUpCircle className="mr-1 h-4 w-4" />
            Add Income
          </Button>
        </Link>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="sm:hidden">
        <Link href="/add-expense">
          <Button
            variant="default"
            size="icon"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            <ArrowDownCircle className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="sm:hidden">
        <Link href="/add-income">
          <Button
            variant="default"
            size="icon"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            <ArrowUpCircle className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" className="border-dashed">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-2">More Actions</span>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/upload-statement" className="flex items-center cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Statement</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/reports" className="flex items-center cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              <span>Generate Report</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
