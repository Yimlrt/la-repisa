import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'la-repisa-cart'

function cartKeyOf(productId, size) {
  return `${productId}::${size || ''}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      // Compatibilidad: si un carrito viejo no tiene cartKey (de antes de las tallas), se lo agregamos.
      return parsed.map((i) => (i.cartKey ? i : { ...i, cartKey: cartKeyOf(i.id, i.size) }))
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(product, qty = 1, size = null) {
    const cartKey = cartKeyOf(product.id, size)
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey)
      if (existing) {
        return prev.map((i) => (i.cartKey === cartKey ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { ...product, qty, size: size || null, cartKey }]
    })
  }

  function removeItem(cartKey) {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey))
  }

  function updateQty(cartKey, qty) {
    if (qty <= 0) return removeItem(cartKey)
    setItems((prev) => prev.map((i) => (i.cartKey === cartKey ? { ...i, qty } : i)))
  }

  function clearCart() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
