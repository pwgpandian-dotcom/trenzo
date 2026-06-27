'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type CartItem = {
  id: number
  name: string
  price: number
  mrp?: number
  image?: string
  category?: string
  shop_name?: string
  seller_id: string
  quantity: number
  stock: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: number) => void
  updateQty: (id: number, qty: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
  total: 0,
  count: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('trenzo_cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('trenzo_cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) }
            : i
        )
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return removeItem(id)
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i)
    )
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
