import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import ProductCard from '../components/ProductCard.jsx'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'La Repisa'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return ['Todas', ...Array.from(set)]
  }, [products])

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'Todas' || p.category === category
    return matchesQuery && matchesCategory
  })

  return (
    <div>
      <section style={styles.hero}>
        <div className="container">
          <span className="tag">un poco de todo</span>
          <h1 style={styles.heroTitle}>Bienvenido a {STORE_NAME}</h1>
          <p style={styles.heroSub}>
            Ropa, bolsos, platos y muchas cosas más — hechas o escogidas con cariño para tu casa.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.search}
          />
          <div style={styles.chips}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  ...styles.chip,
                  ...(category === c ? styles.chipActive : {}),
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>
            {products.length === 0
              ? 'Todavía no hay productos publicados. Ve al panel de administración para agregar el primero.'
              : 'No encontramos productos con ese nombre o categoría.'}
          </p>
        ) : (
          <div style={styles.grid}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const styles = {
  hero: {
    background: 'var(--wine)',
    color: 'var(--paper)',
    padding: '56px 0 48px',
  },
  heroTitle: { fontSize: 'clamp(32px, 5vw, 48px)', margin: '14px 0 10px', color: 'var(--paper)' },
  heroSub: { maxWidth: 480, opacity: 0.85, fontSize: 16, lineHeight: 1.5, margin: 0 },
  controls: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 },
  search: {
    padding: '12px 16px',
    borderRadius: 10,
    border: '1.5px solid rgba(26,20,20,0.15)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    maxWidth: 360,
  },
  chips: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: {
    border: '1.5px solid rgba(26,20,20,0.15)',
    background: '#fff',
    borderRadius: 999,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--wine)',
  },
  chipActive: { background: 'var(--wine)', color: 'var(--paper)', borderColor: 'var(--wine)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 18,
  },
  empty: { padding: '40px 0', textAlign: 'center', color: 'var(--wine)', opacity: 0.7 },
}
