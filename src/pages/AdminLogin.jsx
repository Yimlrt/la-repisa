import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="container" style={{ maxWidth: 380, padding: '80px 20px' }}>
      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Panel de administración</h1>
      <p style={{ opacity: 0.7, marginBottom: 24, fontSize: 14 }}>
        Inicia sesión para gestionar los productos de la tienda.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        {error && <p style={{ color: '#B3413B', fontSize: 13 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  input: {
    padding: '11px 14px',
    borderRadius: 8,
    border: '1.5px solid rgba(26,20,20,0.15)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
  },
}
