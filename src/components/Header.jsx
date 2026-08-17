import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'La Repisa'

export default function Header() {
  const { count } = useCart()

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>{STORE_NAME}</Link>
        <nav style={styles.nav}>
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
    zIndex: 20,
    background: 'var(--paper)',
    borderBottom: '1px solid var(--line)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: 20,
    letterSpacing: '0.02em',
    color: 'var(--ink)',
  },
  nav: { display: 'flex', alignItems: 'center', gap: 24 },
  cartLink: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ink)',
  },
}
