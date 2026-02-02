import { NextResponse } from "next/server"
import { getCategories } from "@/lib/db"
import type { ApiResponse, Category } from "@/lib/types"

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await getCategories()

    return NextResponse.json<ApiResponse<Category[]>>({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
