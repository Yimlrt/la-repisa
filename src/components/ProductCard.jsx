import React from 'react'
import { Link } from 'react-router-dom'
import { formatCOP } from '../lib/format.js'

export default function ProductCard({ product, variantCount }) {
  const sinStock = product.stock <= 0
  const cover = (product.image_urls && product.image_urls[0]) || product.image_url

  return (
    <Link to={`/producto/${product.id}`} style={styles.card}>
      <div style={styles.imageWrap}>
        {cover ? (
          <img src={cover} alt={product.name} style={styles.image} />
        ) : (
          <div style={{ ...styles.image, ...styles.placeholder }}>Sin foto</div>
        )}
        {sinStock && <span style={styles.soldOut}>Agotado</span>}
      </div>
      <div style={styles.body}>
        <span className="eyebrow">{product.category || 'General'}</span>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.price}>{formatCOP(product.price)}</p>
        {variantCount > 1 && <p style={styles.variants}>{variantCount} colores disponibles</p>}
      </div>
    </Link>
  )
}

const styles = {
  card: { display: 'flex', flexDirection: 'column' },
  imageWrap: { position: 'relative', aspectRatio: '3 / 4', background: '#F3F1EE', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
  },
  soldOut: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'var(--paper)',
    color: 'var(--ink)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '3px 8px',
  },
  body: { padding: '12px 2px 0', display: 'flex', flexDirection: 'column', gap: 4 },
  name: { fontSize: 14, fontWeight: 400, fontFamily: 'var(--font-body)', lineHeight: 1.3, marginTop: 2, color: 'var(--ink)' },
  price: { margin: 0, fontSize: 13.5, color: 'var(--muted)', fontWeight: 400 },
  variants: { margin: 0, fontSize: 11, color: 'var(--muted)' },
}
