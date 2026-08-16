import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { formatCOP } from '../lib/format.js'

const emptyForm = { id: null, name: '', price: '', stock: '', category: '', description: '', image_url: '' }

export default function AdminDashboard() {
  const [session, setSession] = useState(undefined)
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) navigate('/admin/login')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      if (!sess) navigate('/admin/login')
    })
    return () => sub.subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (session) loadProducts()
  }, [session])

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    let imageUrl = form.image_url

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
      if (uploadError) {
        setError('No se pudo subir la imagen: ' + uploadError.message)
        setSaving(false)
        return
      }
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(path)
      imageUrl = publicUrl.publicUrl
    }

    const payload = {
      name: form.name,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      category: form.category,
      description: form.description,
      image_url: imageUrl,
    }

    let saveError
    if (form.id) {
      const { error } = await supabase.from('products').update(payload).eq('id', form.id)
      saveError = error
    } else {
      const { error } = await supabase.from('products').insert(payload)
      saveError = error
    }

    setSaving(false)
    if (saveError) {
      setError('No se pudo guardar: ' + saveError.message)
      return
    }
    setForm(emptyForm)
    setFile(null)
    loadProducts()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  function handleEdit(p) {
    setForm({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category || '',
      description: p.description || '',
      image_url: p.image_url || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (session === undefined) return <div className="container" style={{ padding: 60 }}>Cargando...</div>
  if (!session) return null

  return (
    <div className="container" style={{ padding: '32px 0 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Administrar productos</h1>
        <button onClick={handleLogout} className="btn btn-outline">Cerrar sesión</button>
      </div>

      <form onSubmit={handleSave} style={styles.form}>
        <h2 style={{ fontSize: 17, marginBottom: 4 }}>{form.id ? 'Editar producto' : 'Nuevo producto'}</h2>
        <div style={styles.grid2}>
          <input
            placeholder="Nombre del producto"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={styles.input}
          />
          <input
            placeholder="Categoría (ej: Ropa, Bolsos, Platos)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Precio en COP"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            min="0"
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Cantidad disponible"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
            min="0"
            style={styles.input}
          />
        </div>
        <textarea
          placeholder="Descripción (opcional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          style={{ ...styles.input, resize: 'vertical' }}
        />
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Foto del producto {form.image_url && '(ya tiene una, sube otra para reemplazarla)'}
          </label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        {error && <p style={{ color: 'var(--brick)', fontSize: 13 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Publicar producto'}
          </button>
          {form.id && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setForm(emptyForm); setFile(null) }}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <h2 style={{ fontSize: 18, margin: '32px 0 14px' }}>Productos publicados ({products.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map((p) => (
          <div key={p.id} style={styles.row}>
            <div style={styles.thumb}>
              {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, margin: '0 0 2px' }}>{p.name}</p>
              <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
                {formatCOP(p.price)} · {p.stock} disponibles · {p.category || 'Sin categoría'}
              </p>
            </div>
            <button className="btn btn-outline" onClick={() => handleEdit(p)}>Editar</button>
            <button onClick={() => handleDelete(p.id)} style={styles.delete}>Eliminar</button>
          </div>
        ))}
        {products.length === 0 && <p style={{ opacity: 0.6 }}>Aún no hay productos. Agrega el primero arriba.</p>}
      </div>
    </div>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: '#fff',
    border: '1px solid rgba(26,20,20,0.08)',
    borderRadius: 14,
    padding: 20,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: {
    padding: '11px 14px',
    borderRadius: 8,
    border: '1.5px solid rgba(26,20,20,0.15)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    width: '100%',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#fff',
    border: '1px solid rgba(26,20,20,0.08)',
    borderRadius: 12,
    padding: 10,
  },
  thumb: { width: 50, height: 50, borderRadius: 8, background: '#EFE6D6', overflow: 'hidden', flexShrink: 0 },
  delete: { background: 'none', border: 'none', color: 'var(--brick)', fontWeight: 600, fontSize: 13 },
}
