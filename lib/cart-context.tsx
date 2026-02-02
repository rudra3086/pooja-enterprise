"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Customization {
  logoFile: string | null
  logoSize: "small" | "medium" | "large"
  logoPosition: "center" | "corner" | "repeated"
  additionalCost: number
}

export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  customizable: boolean
  customization?: Customization
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateCustomization: (id: string, customization: Customization) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id && !item.customization)
      if (existingItem && !newItem.customization) {
        return prev.map((item) =>
          item.id === newItem.id && !item.customization
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        )
      }
      return [...prev, { ...newItem, quantity: newItem.quantity || 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const updateCustomization = (id: string, customization: Customization) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, customization } : item))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  
  const totalPrice = items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    const customizationCost = item.customization?.additionalCost || 0
    return sum + itemTotal + customizationCost * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateCustomization,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
