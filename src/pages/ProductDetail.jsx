import React, { useEffect, useState, useRef } from 'react'
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
  const [activeImg, setActiveImg] = useState(0)
  const touchStartX = useRef(null)
  const { addItem } = useCart()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(data)
      setActiveImg(0)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="container" style={{ padding: '60px 0' }}>Cargando...</div>
  if (!product) return <div className="container" style={{ padding: '60px 0' }}>Producto no encontrado. <Link to="/">Volver</Link></div>

  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : (product.image_url ? [product.image_url] : [])

  const sinStock = product.stock <= 0

  function next() {
    setActiveImg((i) => (i + 1) % images.length)
  }
  function prev() {
    setActiveImg((i) => (i - 1 + images.length) % images.length)
  }
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (diff > 50) prev()
    else if (diff < -50) next()
    touchStartX.current = null
  }

  return (
    <div className="container" style={styles.wrap}>
      <div>
        <div
          style={styles.imageWrap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 0 ? (
            <img src={images[activeImg]} alt={product.name} style={styles.image} />
          ) : (
            <div style={{ ...styles.image, ...styles.placeholder }}>Sin foto</div>
          )}

          {images.length > 1 && (
            <>
              <button onClick={prev} style={{ ...styles.navBtn, left: 10 }} aria-label="Foto anterior">‹</button>
              <button onClick={next} style={{ ...styles.navBtn, right: 10 }} aria-label="Foto siguiente">›</button>
              <div style={styles.dots}>
                {images.map((_, i) => (
                  <span key={i} style={{ ...styles.dot, opacity: i === activeImg ? 1 : 0.4 }} />
                ))}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div style={styles.thumbRow}>
            {images.map((url, i) => (
              <button
                key={url}
                onClick={() => setActiveImg(i)}
                style={{
                  ...styles.thumbBtn,
                  borderColor: i === activeImg ? 'var(--wine)' : 'transparent',
                }}
              >
                <img src={url} alt={`Foto ${i + 1}`} style={styles.thumbImg} />
              </button>
            ))}
          </div>
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
  imageWrap: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    background: '#EFE6D6',
    aspectRatio: '1/1',
    touchAction: 'pan-y',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', opacity: 0.5 },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.85)',
    color: 'var(--wine)',
    fontSize: 20,
    lineHeight: 1,
    cursor: 'pointer',
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#fff' },
  thumbRow: { display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto' },
  thumbBtn: {
    width: 60,
    height: 60,
    flexShrink: 0,
    borderRadius: 8,
    overflow: 'hidden',
    border: '2px solid transparent',
    padding: 0,
    background: '#EFE6D6',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' },
  title: { fontSize: 30, margin: '10px 0 6px' },
  price: { fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--brick)', margin: '0 0 12px' },
  desc: { lineHeight: 1.6, color: 'var(--ink)', opacity: 0.85, margin: '0 0 20px' },
  soldOut: { color: 'var(--brick)', fontWeight: 600 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 12 },
}
