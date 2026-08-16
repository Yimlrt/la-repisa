import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useCart } from '../lib/cart.jsx'
import { formatCOP } from '../lib/format.js'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="container" style={{ padding: '60px 0' }}>Cargando...</div>
  if (!product) return <div className="container" style={{ padding: '60px 0' }}>Producto no encontrado. <Link to="/">Volver</Link></div>

  const sinStock = product.stock <= 0

  return (
    <div className="container" style={styles.wrap}>
      <div style={styles.imageWrap}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={styles.image} />
        ) : (
          <div style={{ ...styles.image, ...styles.placeholder }}>Sin foto</div>
        )}
      </div>
      <div style={styles.info}>
        <span className="tag">{product.category || 'General'}</span>
        <h1 style={styles.title}>{product.name}</h1>
        <p style={styles.price}>{formatCOP(product.price)}</p>
        <p style={styles.desc}>{product.description || 'Sin descripción disponible.'}</p>

        {sinStock ? (
          <p style={styles.soldOut}>Este producto está agotado por ahora.</p>
        ) : (
          <>
            <div style={styles.qtyRow}>
              <button className="btn btn-outline" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
              <button className="btn btn-outline" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
              <span style={{ fontSize: 13, opacity: 0.6 }}>{product.stock} disponibles</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16, width: '100%' }}
              onClick={() => {
                addItem(product, qty)
                setAdded(true)
                setTimeout(() => setAdded(false), 1800)
              }}
            >
              {added ? '¡Agregado!' : 'Agregar al carrito'}
            </button>
          </>
        )}
        <Link to="/carrito" style={{ display: 'block', marginTop: 12, fontSize: 14, fontWeight: 600, color: 'var(--wine)' }}>
          Ver carrito →
        </Link>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 40,
    padding: '40px 20px 80px',
  },
  imageWrap: { borderRadius: 16, overflow: 'hidden', background: '#EFE6D6', aspectRatio: '1/1' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', opacity: 0.5 },
  info: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' },
  title: { fontSize: 30, margin: '10px 0 6px' },
  price: { fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--brick)', margin: '0 0 12px' },
  desc: { lineHeight: 1.6, color: 'var(--ink)', opacity: 0.85, margin: '0 0 20px' },
  soldOut: { color: 'var(--brick)', fontWeight: 600 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 12 },
}
