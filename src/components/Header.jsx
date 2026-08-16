import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'La Repisa'

export default function Header() {
  const { count } = useCart()

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoMark}>◆</span>
          {STORE_NAME}
        </Link>
        <nav style={styles.nav}>
          <Link to="/carrito" style={styles.cartLink}>
            Carrito
            {count > 0 && <span style={styles.badge}>{count}</span>}
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
    zIndex: 20,
    background: 'var(--paper-soft)',
    borderBottom: '1px solid rgba(26,20,20,0.1)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 68,
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 22,
    color: 'var(--wine)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: { color: 'var(--marigold)', fontSize: 14 },
  nav: { display: 'flex', alignItems: 'center', gap: 20 },
  cartLink: {
    position: 'relative',
    fontWeight: 600,
    fontSize: 14,
    color: 'var(--wine)',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -16,
    background: 'var(--brick)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: '999px',
    padding: '1px 6px',
  },
}
