import { NextRequest, NextResponse } from "next/server"
import { getProductById, getProductBySlug, getCategoryById } from "@/lib/db"
import type { ApiResponse, Product, ProductVariant, Category } from "@/lib/types"

interface ProductDetail extends Product {
  variants: ProductVariant[]
  category: Category | null
}

// GET /api/products/[id] - Get product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find product by ID or slug
    let product = await getProductById(id)
    if (!product) {
      product = await getProductBySlug(id)
    }

    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    // Get category
    const category = product.categoryId ? await getCategoryById(product.categoryId) : null

    const productDetail: ProductDetail = {
      ...product,
      variants: product.variants || [],
      category,
    }

    return NextResponse.json<ApiResponse<ProductDetail>>({
      success: true,
      data: productDetail,
    })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}
