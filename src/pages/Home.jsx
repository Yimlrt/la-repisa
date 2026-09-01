import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import ProductCard from '../components/ProductCard.jsx'

export default function Home() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const audience = searchParams.get('audience') || 'Todos'
  const category = searchParams.get('category') || 'Todas'
  const subcategory = searchParams.get('subcategory') || null
  const isHome = audience === 'Todos' && category === 'Todas' && !subcategory && !query

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

  // Dos categorías con más productos, para el banner grande de portada (como Mango).
  const heroBanners = useMemo(() => {
    const byCategory = {}
    for (const p of products) {
      if (!p.category) continue
      const cover = (p.image_urls && p.image_urls[0]) || p.image_url
      if (!cover) continue
      if (!byCategory[p.category]) {
        byCategory[p.category] = { category: p.category, audience: p.audience || 'Todos', image: cover, count: 0 }
      }
      byCategory[p.category].count += 1
    }
    return Object.values(byCategory).sort((a, b) => b.count - a.count).slice(0, 2)
  }, [products])

  const heading = subcategory || (category !== 'Todas' ? category : (audience !== 'Todos' ? audience : null))

  return (
    <div>
      {isHome ? (
        heroBanners.length > 0 ? (
          <section className="hero-banner">
            {heroBanners.map((h) => (
              <Link
                key={h.category}
                to={`/?audience=${encodeURIComponent(h.audience)}&category=${encodeURIComponent(h.category)}`}
                className="hero-panel"
              >
                <img src={h.image} alt={h.category} className="hero-panel-img" />
                <div className="hero-panel-overlay">
                  <span className="hero-panel-label">{h.category}</span>
                  <span className="hero-panel-link">Ver todo</span>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div style={{ padding: '40px 0' }} />
        )
      ) : (
        <section style={styles.subHero}>
          <div className="container">
            <span className="eyebrow">{heading}</span>
          </div>
        </section>
      )}

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
  subHero: { padding: '32px 0 20px', borderBottom: '1px solid var(--line)' },
  search: {
    padding: '13px 0', border: 'none', borderBottom: '1px solid var(--line)',
    borderRadius: 0, fontSize: 14, fontFamily: 'var(--font-body)', maxWidth: 320,
    background: 'transparent', display: 'block', marginBottom: 36, width: '100%',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', columnGap: 24, rowGap: 40 },
  empty: { padding: '60px 0', textAlign: 'center', color: 'var(--muted)' },
}
