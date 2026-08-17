import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { formatCOP } from '../lib/format.js'
import { rotateImageFile, urlToFile } from '../lib/imageEdit.js'

const emptyForm = { id: null, name: '', price: '', stock: '', category: '', description: '', image_urls: [] }

export default function AdminDashboard() {
  const [session, setSession] = useState(undefined)
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
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

  async function uploadFiles(fileList) {
    const urls = []
    for (const file of fileList) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
      if (uploadError) throw uploadError
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(path)
      urls.push(publicUrl.publicUrl)
    }
    return urls
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    let imageUrls = form.image_urls

    if (files.length > 0) {
      try {
        const newUrls = await uploadFiles(files)
        imageUrls = [...imageUrls, ...newUrls]
      } catch (err) {
        setError('No se pudieron subir las fotos: ' + err.message)
        setSaving(false)
        return
      }
    }

    const payload = {
      name: form.name,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      category: form.category,
      description: form.description,
      image_urls: imageUrls,
      image_url: imageUrls[0] || null, // se mantiene por compatibilidad
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
    setFiles([])
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
      image_urls: p.image_urls && p.image_urls.length > 0 ? p.image_urls : (p.image_url ? [p.image_url] : []),
    })
    setFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function removeExistingImage(url) {
    setForm((f) => ({ ...f, image_urls: f.image_urls.filter((u) => u !== url) }))
  }

  function removePendingFile(index) {
    setFiles((f) => f.filter((_, i) => i !== index))
  }

  async function rotatePendingFile(index) {
    try {
      const rotated = await rotateImageFile(files[index], 90)
      setFiles((f) => f.map((file, i) => (i === index ? rotated : file)))
    } catch (err) {
      setError('No se pudo rotar la foto: ' + err.message)
    }
  }

  async function rotateExistingImage(index) {
    const url = form.image_urls[index]
    setError('')
    try {
      const file = await urlToFile(url, `foto-${index}.jpg`)
      const rotated = await rotateImageFile(file, 90)
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, rotated)
      if (uploadError) throw uploadError
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm((f) => ({
        ...f,
        image_urls: f.image_urls.map((u, i) => (i === index ? publicUrl.publicUrl : u)),
      }))
    } catch (err) {
      setError('No se pudo rotar la foto: ' + err.message)
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/" className="close-link">✕ Ver tienda</Link>
          <button onClick={handleLogout} className="btn btn-outline">Cerrar sesión</button>
        </div>
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
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
            Fotos del producto (puedes subir varias, la primera será la principal)
          </label>

          {form.image_urls.length > 0 && (
            <div style={styles.imageGrid}>
              {form.image_urls.map((url, i) => (
                <div key={url} style={styles.imageThumb}>
                  <img src={url} alt={`Foto ${i + 1}`} style={styles.thumbImg} />
                  {i === 0 && <span style={styles.mainBadge}>Principal</span>}
                  <button type="button" onClick={() => rotateExistingImage(i)} style={styles.rotateBtn} title="Rotar foto">⟳</button>
                  <button type="button" onClick={() => removeExistingImage(url)} style={styles.removeBtn}>×</button>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div style={styles.imageGrid}>
              {files.map((file, i) => (
                <div key={i} style={styles.imageThumb}>
                  <img src={URL.createObjectURL(file)} alt={`Nueva ${i + 1}`} style={styles.thumbImg} />
                  <span style={styles.pendingBadge}>Nueva</span>
                  <button type="button" onClick={() => rotatePendingFile(i)} style={styles.rotateBtn} title="Rotar foto">⟳</button>
                  <button type="button" onClick={() => removePendingFile(i)} style={styles.removeBtn}>×</button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files)])}
          />
        </div>

        {error && <p style={{ color: '#B3413B', fontSize: 13 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Publicar producto'}
          </button>
          {form.id && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setForm(emptyForm); setFiles([]) }}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <h2 style={{ fontSize: 18, margin: '32px 0 14px' }}>Productos publicados ({products.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map((p) => {
          const imgs = p.image_urls && p.image_urls.length > 0 ? p.image_urls : (p.image_url ? [p.image_url] : [])
          return (
            <div key={p.id} style={styles.row}>
              <div style={styles.thumb}>
                {imgs[0] && <img src={imgs[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, margin: '0 0 2px' }}>{p.name}</p>
                <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
                  {formatCOP(p.price)} · {p.stock} disponibles · {p.category || 'Sin categoría'} · {imgs.length} foto{imgs.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button className="btn btn-outline" onClick={() => handleEdit(p)}>Editar</button>
              <button onClick={() => handleDelete(p.id)} style={styles.delete}>Eliminar</button>
            </div>
          )
        })}
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
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: 10,
    marginBottom: 10,
  },
  imageThumb: {
    position: 'relative',
    aspectRatio: '1/1',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#EFE6D6',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  mainBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    background: 'var(--ink)',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
  },
  pendingBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    background: 'var(--accent)',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(26,20,20,0.7)',
    color: '#fff',
    fontSize: 14,
    lineHeight: 1,
    cursor: 'pointer',
  },
  rotateBtn: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(26,20,20,0.7)',
    color: '#fff',
    fontSize: 12,
    lineHeight: 1,
    cursor: 'pointer',
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
  delete: { background: 'none', border: 'none', color: '#B3413B', fontWeight: 600, fontSize: 13 },
}
