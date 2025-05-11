import { NextResponse } from "next/server"
import { testFirebaseAdmin } from "@/lib/firebase-admin-test"

export async function GET() {
  try {
    const result = await testFirebaseAdmin()

    if (result.success) {
      return NextResponse.json({ status: "success", message: result.message })
    } else {
      return NextResponse.json({ status: "error", message: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
