import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'
import { formatCOP } from '../lib/format.js'

export default function Cart() {
  const { items, updateQty, removeItem, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 17, marginBottom: 16 }}>Tu carrito está vacío.</p>
        <Link to="/" className="btn btn-primary">Ver productos</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 0 80px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Tu carrito</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item) => (
          <div key={item.id} style={styles.row}>
            <div style={styles.thumb}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{item.name}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--brick)', margin: 0 }}>
                {formatCOP(item.price)}
              </p>
            </div>
            <div style={styles.qtyBox}>
              <button className="btn btn-outline" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
              <span style={{ minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
              <button className="btn btn-outline" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
            </div>
            <button onClick={() => removeItem(item.id)} style={styles.remove}>Quitar</button>
          </div>
        ))}
      </div>

      <div style={styles.summary}>
        <span style={{ fontSize: 16 }}>Total</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600 }}>{formatCOP(total)}</span>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/pagar')}>
        Ir a pagar
      </button>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#fff',
    border: '1px solid rgba(26,20,20,0.08)',
    borderRadius: 12,
    padding: 12,
  },
  thumb: { width: 60, height: 60, borderRadius: 8, background: '#EFE6D6', overflow: 'hidden', flexShrink: 0 },
  qtyBox: { display: 'flex', alignItems: 'center', gap: 8 },
  remove: { background: 'none', border: 'none', color: 'var(--brick)', fontSize: 13, fontWeight: 600 },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    paddingTop: 20,
    borderTop: '1.5px solid rgba(26,20,20,0.1)',
  },
}
