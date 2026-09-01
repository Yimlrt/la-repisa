import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'
import { supabase } from '../lib/supabase.js'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'La Repisa'
const AUDIENCES = ['Mujeres', 'Hombres', 'Niños', 'Niñas', 'Hogar']

export default function Header() {
  const { count } = useCart()
  const navigate = useNavigate()
  // { [audience]: { [category]: Set(subcategory) } }
  const [menuData, setMenuData] = useState({})
  const [openMenu, setOpenMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(null) // audience abierta
  const [mobileSubExpanded, setMobileSubExpanded] = useState(null) // categoria abierta dentro de la audiencia
  const closeTimer = useRef(null)
  const navRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('audience, category, subcategory')
      const map = {}
      ;(data || []).forEach((p) => {
        const aud = p.audience || null
        if (!aud || !p.category) return
        if (!map[aud]) map[aud] = {}
        if (!map[aud][p.category]) map[aud][p.category] = new Set()
        if (p.subcategory) map[aud][p.category].add(p.subcategory)
      })
      setMenuData(map)
    }
    load()
  }, [])

  useEffect(() => {
    function handleOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null)
        setMobileOpen(false)
      }
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
  function goTo(audience, category, subcategory) {
    setOpenMenu(null)
    setMobileOpen(false)
    setMobileExpanded(null)
    setMobileSubExpanded(null)
    const params = new URLSearchParams()
    params.set('audience', audience)
    if (category) params.set('category', category)
    if (subcategory) params.set('subcategory', subcategory)
    navigate(`/?${params.toString()}`)
  }

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo} onClick={() => setMobileOpen(false)}>{STORE_NAME}</Link>

        <div ref={navRef} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <nav className="desktop-nav">
            {AUDIENCES.map((a) => {
              const categories = Object.keys(menuData[a] || {}).sort()
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
                      {categories.length > 0 ? (
                        categories.map((c) => {
                          const subs = Array.from(menuData[a][c] || []).sort()
                          return (
                            <div key={c}>
                              <button onClick={() => goTo(a, c)} style={styles.dropdownItem}>{c}</button>
                              {subs.map((s) => (
                                <button key={s} onClick={() => goTo(a, c, s)} style={styles.dropdownSubItem}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          )
                        })
                      ) : (
                        <span style={styles.dropdownEmpty}>Aún no hay productos aquí</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <Link to="/carrito" style={styles.cartLink}>Carrito{count > 0 ? ` (${count})` : ''}</Link>

          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menú"
            style={styles.mobileToggle}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-panel">
          <div className="container" style={{ display: 'flex', flexDirection: 'column' }}>
            {AUDIENCES.map((a) => {
              const categories = Object.keys(menuData[a] || {}).sort()
              return (
                <div key={a} style={styles.mobileGroup}>
                  <div style={styles.mobileRow}>
                    <button onClick={() => goTo(a)} style={styles.mobileAudienceBtn}>{a}</button>
                    <button
                      onClick={() => setMobileExpanded((cur) => (cur === a ? null : a))}
                      style={styles.mobileExpandBtn}
                      aria-label={`Categorías de ${a}`}
                    >
                      {mobileExpanded === a ? '−' : '+'}
                    </button>
                  </div>
                  {mobileExpanded === a && (
                    <div style={styles.mobileSub}>
                      {categories.length > 0 ? (
                        categories.map((c) => {
                          const subs = Array.from(menuData[a][c] || []).sort()
                          return (
                            <div key={c}>
                              <div style={styles.mobileRow}>
                                <button onClick={() => goTo(a, c)} style={styles.mobileSubBtn}>{c}</button>
                                {subs.length > 0 && (
                                  <button
                                    onClick={() => setMobileSubExpanded((cur) => (cur === c ? null : c))}
                                    style={styles.mobileExpandBtn}
                                    aria-label={`Subcategorías de ${c}`}
                                  >
                                    {mobileSubExpanded === c ? '−' : '+'}
                                  </button>
                                )}
                              </div>
                              {mobileSubExpanded === c && (
                                <div style={styles.mobileSubSub}>
                                  {subs.map((s) => (
                                    <button key={s} onClick={() => goTo(a, c, s)} style={styles.mobileSubSubBtn}>
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--muted)', padding: '6px 0' }}>
                          Aún no hay productos aquí
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
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
    height: 68,
    gap: 20,
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: 20,
    letterSpacing: '0.02em',
    color: 'var(--ink)',
  },
  navItem: { position: 'relative' },
  navBtn: {
    border: 'none',
    background: 'none',
    padding: '24px 0',
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
    minWidth: 200,
    maxHeight: '70vh',
    overflowY: 'auto',
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    boxShadow: '0 10px 28px rgba(23,20,15,0.10)',
    display: 'flex',
    flexDirection: 'column',
    padding: '6px 0',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    padding: '10px 18px',
    fontSize: 13,
    color: 'var(--ink)',
  },
  dropdownSubItem: {
    display: 'block',
    width: '100%',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    padding: '7px 18px 7px 30px',
    fontSize: 12,
    color: 'var(--muted)',
  },
  dropdownEmpty: { padding: '10px 18px', fontSize: 12, color: 'var(--muted)' },
  cartLink: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ink)',
    whiteSpace: 'nowrap',
  },
  mobileToggle: {
    display: 'none',
    border: 'none',
    background: 'none',
    fontSize: 20,
    lineHeight: 1,
    color: 'var(--ink)',
    padding: 4,
  },
  mobileGroup: { borderBottom: '1px solid var(--line-soft)' },
  mobileRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  mobileAudienceBtn: {
    flex: 1, textAlign: 'left', border: 'none', background: 'none',
    padding: '15px 0', fontSize: 14, fontWeight: 500, letterSpacing: '0.04em',
    textTransform: 'uppercase', color: 'var(--ink)',
  },
  mobileExpandBtn: {
    border: 'none', background: 'none', fontSize: 18, width: 40, height: 40, color: 'var(--muted)', flexShrink: 0,
  },
  mobileSub: { display: 'flex', flexDirection: 'column', paddingLeft: 4, paddingBottom: 10 },
  mobileSubBtn: {
    flex: 1, textAlign: 'left', border: 'none', background: 'none', padding: '9px 4px',
    fontSize: 13, color: 'var(--muted)',
  },
  mobileSubSub: { display: 'flex', flexDirection: 'column', paddingLeft: 16, paddingBottom: 4 },
  mobileSubSubBtn: {
    textAlign: 'left', border: 'none', background: 'none', padding: '8px 4px',
    fontSize: 12.5, color: 'var(--muted)',
  },
}
