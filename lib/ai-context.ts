import type { RowDataPacket } from "mysql2/promise"
import { query } from "@/lib/db"

type ProductContextRow = RowDataPacket & {
  productName: string
  categoryName: string
  basePrice: number | string
  minOrderQuantity: number
  isCustomizable: number | boolean
}

type DeliveryContextRow = RowDataPacket & {
  costPerKm: number | string
  productionLatitude: number | string | null
  productionLongitude: number | string | null
}

const CACHE_TTL_MS = 5 * 60 * 1000
let cachedContext = ""
let cachedAt = 0

function formatInr(value: number | string): string {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "N/A"
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
}

function asBool(value: number | boolean): boolean {
  if (typeof value === "boolean") return value
  return Number(value) === 1
}

async function getCatalogContext(): Promise<string> {
  try {
    const rows = await query<ProductContextRow[]>(
      `SELECT
        p.name as productName,
        c.name as categoryName,
        p.base_price as basePrice,
        p.min_order_quantity as minOrderQuantity,
        p.is_customizable as isCustomizable
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = TRUE
       ORDER BY p.is_featured DESC, p.updated_at DESC
       LIMIT 20`
    )

    if (!rows.length) {
      return "Active catalog snapshot: No active products were found in the database."
    }

    const productLines = rows.map((row) => {
      const customizable = asBool(row.isCustomizable) ? "Yes" : "No"
      return `- ${row.productName} | Category: ${row.categoryName || "General"} | Base Price: INR ${formatInr(row.basePrice)} | MOQ: ${row.minOrderQuantity} | Customizable: ${customizable}`
    })

    return ["Active catalog snapshot (latest 20 products):", ...productLines].join("\n")
  } catch {
    return "Active catalog snapshot: Currently unavailable due to a database read issue."
  }
}

async function getDeliveryContext(): Promise<string> {
  try {
    const rows = await query<DeliveryContextRow[]>(
      `SELECT
        delivery_cost_per_km as costPerKm,
        production_latitude as productionLatitude,
        production_longitude as productionLongitude
       FROM delivery_settings
       ORDER BY updated_at DESC
       LIMIT 1`
    )

    if (!rows.length) {
      return "Delivery settings: Not configured yet in the database."
    }

    const current = rows[0]
    return [
      "Delivery settings snapshot:",
      `- Delivery cost per km: INR ${formatInr(current.costPerKm)}`,
      `- Production coordinates: ${current.productionLatitude ?? "N/A"}, ${current.productionLongitude ?? "N/A"}`,
    ].join("\n")
  } catch {
    return "Delivery settings snapshot: Currently unavailable due to a database read issue."
  }
}

export async function getWebsiteAiContext(): Promise<string> {
  const now = Date.now()
  if (cachedContext && now - cachedAt < CACHE_TTL_MS) {
    return cachedContext
  }

  const staticContext = [
    "Website profile:",
    "- Brand: Pooja Enterprise",
    "- Business type: B2B tissue and packaging supplier",
    "- Audience: businesses placing bulk orders",
    "",
    "Official company contact details (from website):",
    "- Address: Plot No 2900/75, Shree Sardar Patel Industrial Estate (Old Indochem) GIDC Estate, Ankleswar 393002, Gujarat, India",
    "- Google Maps: https://maps.app.goo.gl/d1ojvPpPkTxxM3sy6",
    "- Phone: +91 9913938188",
    "- Email: pooja123enterprise@gmail.com",
    "- Business Hours: Mon - Fri 9:00 AM - 6:00 PM, Sat 9:00 AM - 1:00 PM",
    "",
    "Supported website flows:",
    "- Product browsing by category, variant-aware pricing, and stock visibility",
    "- Product customization with logo upload and placement/size options where supported",
    "- Cart, checkout, shipping or self-pickup, and order placement",
    "- Client registration/login, dashboard, profile updates, and order tracking",
    "- Contact inquiry form and admin support reply workflow",
    "",
    "Assistant behavior rules:",
    "- Prefer website-supported actions when giving guidance",
    "- If user asks for location, always provide the exact address and maps link above",
    "- Never invent exact prices, delivery timelines, stock guarantees, or policy commitments",
    "- If data is missing, ask concise clarifying questions or direct user to contact sales",
    "- Keep responses short, professional, and action-oriented",
  ].join("\n")

  const [catalogContext, deliveryContext] = await Promise.all([
    getCatalogContext(),
    getDeliveryContext(),
  ])

  cachedContext = [staticContext, catalogContext, deliveryContext].join("\n\n")
  cachedAt = now
  return cachedContext
}
