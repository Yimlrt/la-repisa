import React from 'react'
import { Link } from 'react-router-dom'
import { formatCOP } from '../lib/format.js'

export default function ProductCard({ product }) {
  const sinStock = product.stock <= 0

  return (
    <Link to={`/producto/${product.id}`} style={styles.card}>
      <div style={styles.imageWrap}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={styles.image} />
        ) : (
          <div style={{ ...styles.image, ...styles.placeholder }}>
            Sin foto
          </div>
        )}
        {sinStock && <span style={styles.soldOut}>Agotado</span>}
      </div>
      <div style={styles.body}>
        <span className="tag" style={{ fontSize: 10 }}>{product.category || 'General'}</span>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.price}>{formatCOP(product.price)}</p>
      </div>
    </Link>
  )
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(26,20,20,0.08)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  },
  imageWrap: { position: 'relative', aspectRatio: '1 / 1', background: '#EFE6D6' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--wine)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    opacity: 0.5,
  },
  soldOut: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'var(--wine)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 6,
  },
  body: { padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', gap: 6 },
  name: { fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', lineHeight: 1.3 },
  price: { margin: 0, fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--brick)', fontWeight: 500 },
}
