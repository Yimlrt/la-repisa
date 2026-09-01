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
  const category = searchParams.get('category') || 'Todas'
  const subcategory = searchParams.get('subcategory') || null

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

  const filtered = byAudience.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'Todas' || p.category === category
    const matchesSubcategory = !subcategory || p.subcategory === subcategory
    return matchesQuery && matchesCategory && matchesSubcategory
  })

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
          <h1 style={styles.heroTitle}>{STORE_NAME}</h1>
        </div>
      </section>

      <section className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <input
          type="text"
          placeholder="Buscar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.search}
        />

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
  hero: { padding: '56px 0 32px', borderBottom: '1px solid var(--line)' },
  heroTitle: { fontSize: 'clamp(38px, 6vw, 56px)', margin: 0, color: 'var(--ink)' },
  search: {
    padding: '13px 0', border: 'none', borderBottom: '1px solid var(--line)',
    borderRadius: 0, fontSize: 14, fontFamily: 'var(--font-body)', maxWidth: 320,
    background: 'transparent', display: 'block', marginBottom: 36, width: '100%',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', columnGap: 24, rowGap: 40 },
  empty: { padding: '60px 0', textAlign: 'center', color: 'var(--muted)' },
}