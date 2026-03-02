export function sanitizeInput(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.trim()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s()-]/g, "")
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone)
  return /^(\+?[0-9]{10,15})$/.test(normalized)
}

export function isValidIndianGstNumber(gstNumber: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(gstNumber)
}

export function isValidPostalCode(postalCode: string): boolean {
  return /^[0-9]{6}$/.test(postalCode)
}
