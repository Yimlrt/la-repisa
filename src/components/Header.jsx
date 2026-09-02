import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'
import { supabase } from '../lib/supabase.js'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'La Repisa'
const AUDIENCES = ['Mujeres', 'Hombres', 'Niños', 'Niñas', 'Hogar']

export default function Header() {
  const { count } = useCart()
  const navigate = useNavigate()
  const [menuData, setMenuData] = useState({})
  const [openMenu, setOpenMenu] = useState(null)
  const [openCategory, setOpenCategory] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState(AUDIENCES[0])
  const [mobileOpenCategory, setMobileOpenCategory] = useState(null)
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
        setOpenCategory(null)
      }
    }
    document.addEventListener('click', handleOutside)
    return () => document.removeEventListener('click', handleOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  function openNow(a) {
    clearTimeout(closeTimer.current)
    setOpenMenu(a)
    setOpenCategory(null)
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180)
  }
  function toggle(a) {
    setOpenMenu((cur) => (cur === a ? null : a))
    setOpenCategory(null)
  }
  function goTo(audience, category, subcategory) {
    setOpenMenu(null)
    setOpenCategory(null)
    setMobileOpen(false)
    setMobileOpenCategory(null)
    const params = new URLSearchParams()
    params.set('audience', audience)
    if (category) params.set('category', category)
    if (subcategory) params.set('subcategory', subcategory)
    navigate(`/?${params.toString()}`)
  }
  function openMobile() {
    setMobileTab(AUDIENCES[0])
    setMobileOpenCategory(null)
    setMobileOpen(true)
  }

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>{STORE_NAME}</Link>

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
                          const hasSubs = subs.length > 0
                          return (
                            <div key={c}>
                              <div style={styles.dropdownRow}>
                                <button onClick={() => goTo(a, c)} style={{ ...styles.dropdownItem, flex: 1 }}>{c}</button>
                                {hasSubs && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setOpenCategory((cur) => (cur === c ? null : c)) }}
                                    style={styles.dropdownExpandBtn}
                                    aria-label={`Subcategorías de ${c}`}
                                  >
                                    {openCategory === c ? '−' : '+'}
                                  </button>
                                )}
                              </div>
                              {hasSubs && openCategory === c && subs.map((s) => (
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

          <button className="mobile-toggle" onClick={openMobile} aria-label="Menú" style={styles.mobileToggle}>
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-fullscreen">
          <div style={styles.mobileTopRow}>
            <div style={styles.mobileTabs}>
              {AUDIENCES.map((a) => (
                <button
                  key={a}
                  onClick={() => { setMobileTab(a); setMobileOpenCategory(null) }}
                  style={{
                    ...styles.mobileTab,
                    color: mobileTab === a ? 'var(--ink)' : 'var(--muted)',
                    borderBottomColor: mobileTab === a ? 'var(--ink)' : 'transparent',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            <button onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" style={styles.mobileClose}>✕</button>
          </div>

          <div style={styles.mobileList}>
            <button onClick={() => goTo(mobileTab)} style={styles.mobileListItem}>
              Ver todo {mobileTab.toLowerCase()}
            </button>
            {Object.keys(menuData[mobileTab] || {}).sort().map((c) => {
              const subs = Array.from(menuData[mobileTab][c] || []).sort()
              const hasSubs = subs.length > 0
              return (
                <div key={c}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => goTo(mobileTab, c)} style={{ ...styles.mobileListItem, flex: 1, borderBottom: 'none' }}>
                      {c}
                    </button>
                    {hasSubs && (
                      <button
                        onClick={() => setMobileOpenCategory((cur) => (cur === c ? null : c))}
                        style={styles.mobileExpandBtn}
                        aria-label={`Subcategorías de ${c}`}
                      >
                        {mobileOpenCategory === c ? '−' : '+'}
                      </button>
                    )}
                  </div>
                  <div style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    {hasSubs && mobileOpenCategory === c && subs.map((s) => (
                      <button key={s} onClick={() => goTo(mobileTab, c, s)} style={styles.mobileListSubItem}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            {Object.keys(menuData[mobileTab] || {}).length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>
                Aún no hay productos aquí.
              </p>
            )}

            <div style={styles.mobileCartRow}>
              <Link to="/carrito" onClick={() => setMobileOpen(false)} style={styles.mobileCartLink}>
                Ver carrito{count > 0 ? ` (${count})` : ''}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

const styles = {
  header: { position: 'sticky', top: 0, zIndex: 30, background: 'var(--paper)', borderBottom: '1px solid var(--line)' },
  inner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, gap: 20 },
  logo: { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, letterSpacing: '0.02em', color: 'var(--ink)' },
  navItem: { position: 'relative' },
  navBtn: {
    border: 'none', background: 'none', padding: '24px 0', fontSize: 12, fontWeight: 500,
    letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)',
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, minWidth: 210, maxHeight: '70vh', overflowY: 'auto',
    background: 'var(--paper)', border: '1px solid var(--line)', boxShadow: '0 10px 28px rgba(23,20,15,0.10)',
    display: 'flex', flexDirection: 'column', padding: '6px 0',
  },
  dropdownRow: { display: 'flex', alignItems: 'center' },
  dropdownItem: {
    display: 'block', width: '100%', border: 'none', background: 'none',
    textAlign: 'left', padding: '10px 18px', fontSize: 13, color: 'var(--ink)',
  },
  dropdownExpandBtn: {
    border: 'none', background: 'none', fontSize: 15, width: 32, height: 32, color: 'var(--muted)', flexShrink: 0,
  },
  dropdownSubItem: {
    display: 'block', width: '100%', border: 'none', background: 'none',
    textAlign: 'left', padding: '7px 18px 7px 30px', fontSize: 12, color: 'var(--muted)',
  },
  dropdownEmpty: { padding: '10px 18px', fontSize: 12, color: 'var(--muted)' },
  cartLink: { fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap' },
  mobileToggle: { display: 'none', border: 'none', background: 'none', fontSize: 20, color: 'var(--ink)', padding: 4 },
  mobileTopRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--line)' },
  mobileTabs: { display: 'flex', gap: 18, overflowX: 'auto' },
  mobileTab: {
    border: 'none', background: 'none', padding: '6px 0 10px', fontSize: 13, fontWeight: 600,
    letterSpacing: '0.03em', textTransform: 'uppercase', borderBottom: '2px solid transparent', whiteSpace: 'nowrap',
  },
  mobileClose: { border: 'none', background: 'none', fontSize: 20, color: 'var(--ink)', padding: 4 },
  mobileList: { padding: '10px 20px 40px', overflowY: 'auto', flex: 1 },
  mobileListItem: {
    display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'none',
    padding: '16px 0', fontSize: 16, fontWeight: 600, color: 'var(--ink)', borderBottom: '1px solid var(--line-soft)',
  },
  mobileExpandBtn: { border: 'none', background: 'none', fontSize: 18, width: 40, height: 40, color: 'var(--muted)', flexShrink: 0 },
  mobileListSubItem: {
    display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'none',
    padding: '12px 0 12px 14px', fontSize: 14, color: 'var(--muted)',
  },
  mobileCartRow: { marginTop: 24 },
  mobileCartLink: {
    display: 'block', textAlign: 'center', padding: '14px 0', border: '1px solid var(--ink)',
    fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink)',
  },
}
