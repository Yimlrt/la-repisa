import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'
import { supabase } from '../lib/supabase.js'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'La Repisa'
const AUDIENCES = ['Mujeres', 'Hombres', 'Niños']

export default function Header() {
  const { count } = useCart()
  const navigate = useNavigate()
  const [categoriesByAudience, setCategoriesByAudience] = useState({})
  const [openMenu, setOpenMenu] = useState(null)
  const closeTimer = useRef(null)
  const navRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('audience, category')
      const map = {}
      ;(data || []).forEach((p) => {
        const aud = p.audience || null
        if (!aud) return
        if (!map[aud]) map[aud] = new Set()
        if (p.category) map[aud].add(p.category)
      })
      setCategoriesByAudience(map)
    }
    load()
  }, [])

  useEffect(() => {
    function handleOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('click', handleOutside)
    return () => document.removeEventListener('click', handleOutside)
  }, [])

  function openNow(a) {
    clearTimeout(closeTimer.current)
    setOpenMenu(a)
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180)
  }
  function toggle(a) {
    setOpenMenu((cur) => (cur === a ? null : a))
  }
  function goTo(audience, category) {
    setOpenMenu(null)
    const params = new URLSearchParams()
    params.set('audience', audience)
    if (category) params.set('category', category)
    navigate(`/?${params.toString()}`)
  }

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>{STORE_NAME}</Link>

        <nav ref={navRef} style={styles.nav}>
          {AUDIENCES.map((a) => {
            const cats = Array.from(categoriesByAudience[a] || []).sort()
            return (
              <div
                key={a}
                style={styles.navItem}
                onMouseEnter={() => openNow(a)}
                onMouseLeave={closeSoon}
              >
                <button onClick={() => toggle(a)} style={styles.navBtn}>{a}</button>
                {openMenu === a && (
                  <div style={styles.dropdown} onMouseEnter={() => openNow(a)} onMouseLeave={closeSoon}>
                    <button onClick={() => goTo(a)} style={{ ...styles.dropdownItem, fontWeight: 600 }}>
                      Ver todo
                    </button>
                    {cats.length > 0 ? (
                      cats.map((c) => (
                        <button key={c} onClick={() => goTo(a, c)} style={styles.dropdownItem}>{c}</button>
                      ))
                    ) : (
                      <span style={styles.dropdownEmpty}>Aún no hay productos aquí</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          <Link to="/carrito" style={styles.cartLink}>
            Carrito{count > 0 ? ` (${count})` : ''}
          </Link>
        </nav>
      </div>
    </header>
  )
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    background: 'var(--paper)',
    borderBottom: '1px solid var(--line)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
    gap: 24,
    flexWrap: 'wrap',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: 20,
    letterSpacing: '0.02em',
    color: 'var(--ink)',
  },
  nav: { display: 'flex', alignItems: 'center', gap: 28 },
  navItem: { position: 'relative' },
  navBtn: {
    border: 'none',
    background: 'none',
    padding: '26px 0',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: 180,
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    boxShadow: '0 8px 24px rgba(23,20,15,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '6px 0',
  },
  dropdownItem: {
    border: 'none',
    background: 'none',
    textAlign: 'left',
    padding: '9px 18px',
    fontSize: 13,
    color: 'var(--ink)',
  },
  dropdownEmpty: {
    padding: '9px 18px',
    fontSize: 12,
    color: 'var(--muted)',
  },
  cartLink: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ink)',
  },
}
