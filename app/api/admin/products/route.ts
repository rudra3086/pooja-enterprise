import { NextRequest, NextResponse } from "next/server"
import { getAllProductsForAdmin, updateProduct, getSessionByToken } from "@/lib/db"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false
  
  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

// GET /api/admin/products - Get all products for admin
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await getAllProductsForAdmin()
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/products - Update product
export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      productId,
      name,
      description,
      shortDescription,
      basePrice,
      minOrderQuantity,
      imageUrl,
      isActive,
      isFeatured,
      isCustomizable,
      customizationOptions,
    } = body

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (shortDescription !== undefined) updates.shortDescription = shortDescription
    if (basePrice !== undefined) updates.basePrice = parseFloat(basePrice)
    if (minOrderQuantity !== undefined) updates.minOrderQuantity = parseInt(minOrderQuantity)
    if (imageUrl !== undefined) updates.imageUrl = imageUrl
    if (isActive !== undefined) updates.isActive = isActive
    if (isFeatured !== undefined) updates.isFeatured = isFeatured
    if (isCustomizable !== undefined) updates.isCustomizable = isCustomizable
    if (customizationOptions !== undefined) updates.customizationOptions = customizationOptions

    const success = await updateProduct(productId, updates)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}
