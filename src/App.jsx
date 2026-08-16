import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import ThankYou from './pages/ThankYou.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'La Repisa'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/pagar" element={<Checkout />} />
          <Route path="/pedido-registrado" element={<ThankYou />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer style={styles.footer}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>© {new Date().getFullYear()} {STORE_NAME}</span>
          <Link to="/admin/login" style={{ opacity: 0.6 }}>Panel de administración</Link>
        </div>
      </footer>
    </div>
  )
}

function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: 26, marginBottom: 10 }}>Página no encontrada</h1>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  )
}

const styles = {
  footer: {
    borderTop: '1px solid rgba(26,20,20,0.1)',
    padding: '20px 0',
    fontSize: 13,
    opacity: 0.8,
  },
}
