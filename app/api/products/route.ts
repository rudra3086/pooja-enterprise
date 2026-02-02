import { NextRequest, NextResponse } from "next/server"
import { getProducts, getCategoryBySlug, getCategoryById } from "@/lib/db"
import type { ApiResponse, Product, PaginatedResponse } from "@/lib/types"

// GET /api/products - Get all products with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    // Get category ID if slug provided
    let categoryId: string | undefined
    if (category) {
      const categoryObj = await getCategoryBySlug(category) || await getCategoryById(category)
      if (categoryObj) {
        categoryId = categoryObj.id
      }
    }

    const { products, total } = await getProducts({
      categoryId,
      search: search || undefined,
      featured: featured === "true",
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json<ApiResponse<PaginatedResponse<Product>>>({
      success: true,
      data: {
        data: products,
        total,
        page,
        pageSize,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
