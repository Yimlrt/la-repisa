import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useCart } from '../lib/cart.jsx'
import { formatCOP } from '../lib/format.js'
import { colorToHex } from '../lib/colors.js'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)
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
      setQty(1)
      setSelectedSize(null)

      if (data && data.model_group) {
        const { data: siblings } = await supabase
          .from('products')
          .select('*')
          .eq('model_group', data.model_group)
          .order('color', { ascending: true })
        setVariants(siblings || [])
      } else {
        setVariants([])
      }

      setLoading(false)
      window.scrollTo({ top: 0 })
    }
    load()
  }, [id])

  if (loading) return <div className="container" style={{ padding: '60px 0' }}>Cargando...</div>
  if (!product) return <div className="container" style={{ padding: '60px 0' }}>Producto no encontrado. <Link to="/">Volver</Link></div>

  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : (product.image_url ? [product.image_url] : [])

  const sinStock = product.stock <= 0

  function next() { setActiveImg((i) => (i + 1) % images.length) }
  function prev() { setActiveImg((i) => (i - 1 + images.length) % images.length) }
  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (diff > 50) prev()
    else if (diff < -50) next()
    touchStartX.current = null
  }

  return (
    <div>
      <div className="container" style={{ padding: '24px 24px 0' }}>
        <Link to="/" style={styles.back}>← Volver</Link>
      </div>

      <div className="container pd-wrap">
        <div>
          <div style={styles.imageWrap} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {images.length > 0 ? (
              <img src={images[activeImg]} alt={product.name} style={styles.image} />
            ) : (
              <div style={{ ...styles.image, ...styles.placeholder }}>Sin foto</div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={prev} className="pd-navbtn" style={{ left: 8 }} aria-label="Foto anterior">‹</button>
                <button onClick={next} className="pd-navbtn" style={{ right: 8 }} aria-label="Foto siguiente">›</button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div style={styles.thumbRow}>
              {images.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setActiveImg(i)}
                  style={{ ...styles.thumbBtn, borderColor: i === activeImg ? 'var(--ink)' : 'transparent' }}
                >
                  <img src={url} alt={`Foto ${i + 1}`} style={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={styles.info}>
          <span className="eyebrow">{product.category || 'General'}</span>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.price}>{formatCOP(product.price)}</p>

          <div style={styles.divider} />

          {variants.length > 1 && (
            <div style={{ marginBottom: 24 }}>
              <span style={styles.qtyLabel}>Color: {product.color || '—'}</span>
              <div style={styles.swatchRow}>
                {variants.map((v) => {
                  const hex = colorToHex(v.color)
                  const isActive = v.id === product.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/producto/${v.id}`)}
                      title={v.color || 'Color'}
                      style={{
                        ...styles.swatch,
                        borderColor: isActive ? 'var(--ink)' : 'var(--line)',
                        borderWidth: isActive ? 2 : 1,
                        opacity: v.stock <= 0 ? 0.35 : 1,
                        background: hex || '#EFEAE1',
                      }}
                    >
                      {!hex && <span style={styles.swatchLabel}>{(v.color || '?').slice(0, 3)}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <p style={styles.desc}>{product.description || 'Sin descripción disponible.'}</p>

          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <span style={styles.qtyLabel}>Talla{selectedSize ? `: ${selectedSize}` : ''}</span>
              <div style={styles.swatchRow}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      ...styles.sizeBtn,
                      borderColor: selectedSize === s ? 'var(--ink)' : 'var(--line)',
                      background: selectedSize === s ? 'var(--ink)' : 'transparent',
                      color: selectedSize === s ? 'var(--paper)' : 'var(--ink)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sinStock ? (
            <p style={styles.soldOut}>Agotado</p>
          ) : (
            <>
              <div style={styles.qtyRow}>
                <span style={styles.qtyLabel}>Cantidad</span>
                <div style={styles.qtyBox}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={styles.qtyBtn}>−</button>
                  <span style={{ minWidth: 28, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} style={styles.qtyBtn}>+</button>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{product.stock} disponibles</span>
              </div>
              {product.sizes && product.sizes.length > 0 && !selectedSize && (
                <p style={styles.sizeWarning}>Elige una talla para continuar.</p>
              )}
              <button
                className="btn btn-primary"
                style={{ marginTop: 20, width: '100%' }}
                disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
                onClick={() => {
                  addItem(product, qty, selectedSize)
                  setAdded(true)
                  setTimeout(() => setAdded(false), 1800)
                }}
              >
                {added ? 'Agregado' : 'Agregar al carrito'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  back: { fontSize: 12, color: 'var(--muted)', letterSpacing: '0.02em' },
  imageWrap: { position: 'relative', background: '#F3F1EE', aspectRatio: '3/4', overflow: 'hidden', touchAction: 'pan-y' },
  image: { width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 },
  thumbRow: { display: 'flex', gap: 8, marginTop: 10 },
  thumbBtn: { width: 64, height: 64, flexShrink: 0, overflow: 'hidden', border: '1px solid transparent', padding: 0, background: '#F3F1EE' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { paddingTop: 6 },
  title: { fontSize: 28, margin: '14px 0 8px', color: 'var(--ink)' },
  price: { fontSize: 18, color: 'var(--ink)', margin: 0, fontWeight: 500 },
  divider: { height: 1, background: 'var(--line)', margin: '24px 0' },
  desc: { lineHeight: 1.7, color: 'var(--muted)', fontSize: 14, margin: '0 0 28px' },
  soldOut: { color: 'var(--ink)', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  qtyLabel: { fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' },
  qtyBox: { display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--line)', padding: '4px 10px' },
  qtyBtn: { border: 'none', background: 'none', fontSize: 16, width: 22, color: 'var(--ink)' },
  swatchRow: { display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  swatch: {
    width: 34, height: 34, borderRadius: 4, border: '1px solid var(--line)',
    padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  swatchDot: { width: '100%', height: '100%', borderRadius: '50%', display: 'block' },
  swatchLabel: { fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase' },
  sizeBtn: {
    minWidth: 40, height: 40, padding: '0 12px', borderRadius: 4,
    border: '1.5px solid var(--line)', fontSize: 13, fontWeight: 500,
  },
  sizeWarning: { fontSize: 12, color: 'var(--muted)', margin: '10px 0 0' },
}
