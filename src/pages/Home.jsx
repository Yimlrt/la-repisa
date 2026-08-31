import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import ProductCard from '../components/ProductCard.jsx'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'La Repisa'

export default function Home() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const audience = searchParams.get('audience') || 'Todos'
  const initialCategory = searchParams.get('category') || 'Todas'
  const [category, setCategory] = useState(initialCategory)

  useEffect(() => {
    setCategory(searchParams.get('category') || 'Todas')
  }, [searchParams])

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

  const byAudience = useMemo(() => {
    if (audience === 'Todos') return products
    return products.filter((p) => (p.audience || null) === audience)
  }, [products, audience])

  const categories = useMemo(() => {
    const set = new Set(byAudience.map((p) => p.category).filter(Boolean))
    return ['Todas', ...Array.from(set)]
  }, [byAudience])

  const filtered = byAudience.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'Todas' || p.category === category
    return matchesQuery && matchesCategory
  })

  // Agrupa variantes del mismo modelo (mismo diseño, distinto color) en una sola tarjeta.
  const { display, variantCounts } = useMemo(() => {
    const seen = new Set()
    const list = []
    const counts = {}
    for (const p of filtered) {
      const key = p.model_group ? `group:${p.model_group}` : `single:${p.id}`
      counts[key] = (counts[key] || 0) + 1
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ ...p, __key: key })
    }
    return { display: list, variantCounts: counts }
  }, [filtered])

  return (
    <div>
      <section style={styles.hero}>
        <div className="container">
          <span className="eyebrow">{audience !== 'Todos' ? audience : 'Nueva colección'}</span>
          <h1 style={styles.heroTitle}>{STORE_NAME}</h1>
          <p style={styles.heroSub}>Ropa, bolsos, hogar y más — seleccionado con cuidado.</p>
        </div>
      </section>

      <section className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.search}
          />
          <div style={styles.chips}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{ ...styles.chip, ...(category === c ? styles.chipActive : {}) }}
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
        ) : display.length === 0 ? (
          <p style={styles.empty}>
            {products.length === 0
              ? 'Todavía no hay productos publicados.'
              : 'No encontramos productos con ese nombre o categoría.'}
          </p>
        ) : (
          <div style={styles.grid}>
            {display.map((p) => (
              <ProductCard key={p.id} product={p} variantCount={variantCounts[p.__key]} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const styles = {
  hero: { padding: '64px 0 40px', borderBottom: '1px solid var(--line)' },
  heroTitle: { fontSize: 'clamp(38px, 6vw, 56px)', margin: '16px 0 12px', color: 'var(--ink)' },
  heroSub: { maxWidth: 420, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, margin: 0 },
  controls: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 },
  search: {
    padding: '13px 0', border: 'none', borderBottom: '1px solid var(--line)',
    borderRadius: 0, fontSize: 14, fontFamily: 'var(--font-body)', maxWidth: 320, background: 'transparent',
  },
  chips: { display: 'flex', gap: 20, flexWrap: 'wrap', borderBottom: '1px solid var(--line-soft)', paddingBottom: 16 },
  chip: {
    border: 'none', background: 'none', padding: 0, fontSize: 12,
    letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--muted)',
  },
  chipActive: { color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', columnGap: 24, rowGap: 40 },
  empty: { padding: '60px 0', textAlign: 'center', color: 'var(--muted)' },
}
