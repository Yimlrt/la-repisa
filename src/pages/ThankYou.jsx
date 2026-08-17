import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'

export default function OrderPending() {
  const { clearCart } = useCart()
  useEffect(() => { clearCart() }, [])

  return (
    <div className="container" style={{ padding: '110px 24px', textAlign: 'center' }}>
      <span className="eyebrow">Pedido registrado</span>
      <h1 style={{ fontSize: 26, margin: '16px 0 14px', fontWeight: 500 }}>
        Confirma tu comprobante por WhatsApp
      </h1>
      <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 8px', fontSize: 14, lineHeight: 1.7 }}>
        Tu pedido quedó anotado, pero todavía no se despacha. En cuanto confirmemos el comprobante de tu
        transferencia por WhatsApp, empezamos a alistarlo.
      </p>
      <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 32px', fontSize: 13, lineHeight: 1.7 }}>
        Si cerraste WhatsApp sin enviar la captura, escríbenos de nuevo con tu foto del comprobante y el número de pedido.
      </p>
      <Link to="/" className="btn btn-primary">Seguir viendo productos</Link>
    </div>
  )
}
