import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'
import { formatCOP } from '../lib/format.js'

export default function Cart() {
  const { items, updateQty, removeItem, clearCart, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 20 }}>Tu carrito está vacío.</p>
        <Link to="/" className="btn btn-primary">Ver productos</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '48px 24px 100px', maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>Carrito</h1>
        <Link to="/" className="close-link">✕ Cerrar</Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item) => {
          const cover = (item.image_urls && item.image_urls[0]) || item.image_url
          return (
            <div key={item.cartKey} style={styles.row}>
              <div style={styles.thumb}>
                {cover && <img src={cover} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, margin: '0 0 4px', fontSize: 14 }}>{item.name}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  {formatCOP(item.price)}
                  {item.color ? ` · Color ${item.color}` : ''}
                  {item.size ? ` · Talla ${item.size}` : ''}
                </p>
              </div>
              <div style={styles.qtyBox}>
                <button onClick={() => updateQty(item.cartKey, item.qty - 1)} style={styles.qtyBtn}>−</button>
                <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13 }}>{item.qty}</span>
                <button onClick={() => updateQty(item.cartKey, item.qty + 1)} style={styles.qtyBtn}>+</button>
              </div>
              <p style={{ fontSize: 14, minWidth: 90, textAlign: 'right', margin: 0 }}>{formatCOP(item.price * item.qty)}</p>
              <button onClick={() => removeItem(item.cartKey)} style={styles.remove}>Quitar</button>
            </div>
          )
        })}
      </div>

      <button onClick={clearCart} style={styles.clearAll}>Vaciar carrito</button>

      <div style={styles.summary}>
        <span style={{ fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>Total</span>
        <span style={{ fontSize: 20, fontWeight: 500 }}>{formatCOP(total)}</span>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={() => navigate('/pagar')}>
        Continuar con el pago
      </button>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '18px 0',
    borderBottom: '1px solid var(--line)',
  },
  thumb: { width: 68, height: 84, background: '#F3F1EE', overflow: 'hidden', flexShrink: 0 },
  qtyBox: { display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', padding: '4px 10px' },
  qtyBtn: { border: 'none', background: 'none', fontSize: 15, color: 'var(--ink)', width: 16 },
  remove: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, textDecoration: 'underline' },
  clearAll: {
    background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12,
    textDecoration: 'underline', marginTop: 16, padding: 0, cursor: 'pointer',
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1px solid var(--ink)',
  },
}
