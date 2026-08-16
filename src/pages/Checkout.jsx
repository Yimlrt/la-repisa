import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart.jsx'
import { formatCOP } from '../lib/format.js'

const NEQUI_NUMBER = import.meta.env.VITE_NEQUI_NUMBER || ''
const NEQUI_HOLDER = import.meta.env.VITE_NEQUI_HOLDER || ''
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || ''

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [copied, setCopied] = useState(false)

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Tu carrito está vacío.</p>
        <Link to="/" className="btn btn-primary">Ver productos</Link>
      </div>
    )
  }

  const reference = `LR-${Date.now().toString().slice(-6)}`
  const configured = NEQUI_NUMBER && WHATSAPP_NUMBER

  function copyNumber() {
    navigator.clipboard.writeText(NEQUI_NUMBER)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleSendProof() {
    const lines = items.map((i) => `• ${i.qty} x ${i.name} — ${formatCOP(i.price * i.qty)}`).join('\n')
    const message =
      `Hola! Quiero confirmar mi pedido *${reference}*\n\n` +
      `${lines}\n\n` +
      `Total: ${formatCOP(total)}\n\n` +
      `Nombre: ${name}\n` +
      `Teléfono: ${phone}\n` +
      `Dirección de entrega: ${address}\n\n` +
      `Ya hice la transferencia por Nequi, adjunto el comprobante.`

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    clearCart()
    navigate('/pedido-registrado')
  }

  return (
    <div className="container" style={{ padding: '40px 0 80px', maxWidth: 520 }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Confirmar pedido</h1>
      <p style={{ opacity: 0.7, marginBottom: 28 }}>
        Pagas por Nequi y confirmas por WhatsApp. Así de simple.
      </p>

      <div style={styles.summary}>
        {items.map((i) => (
          <div key={i.id} style={styles.line}>
            <span>{i.qty} × {i.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCOP(i.price * i.qty)}</span>
          </div>
        ))}
        <div style={{ ...styles.line, borderTop: '1.5px solid rgba(26,20,20,0.12)', paddingTop: 10, fontWeight: 700 }}>
          <span>Total</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCOP(total)}</span>
        </div>
      </div>

      {!configured && (
        <p style={styles.warning}>
          ⚠️ Falta configurar VITE_NEQUI_NUMBER y VITE_WHATSAPP_NUMBER en el archivo .env para que este paso funcione.
        </p>
      )}

      <div style={styles.step}>
        <span className="tag" style={{ marginBottom: 10 }}>paso 1</span>
        <p style={{ margin: '0 0 10px', fontWeight: 600 }}>Transfiere {formatCOP(total)} a este Nequi:</p>
        <div style={styles.nequiBox}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, margin: 0 }}>{NEQUI_NUMBER || '—'}</p>
            {NEQUI_HOLDER && <p style={{ fontSize: 13, opacity: 0.7, margin: '2px 0 0' }}>{NEQUI_HOLDER}</p>}
          </div>
          <button type="button" className="btn btn-outline" onClick={copyNumber} disabled={!NEQUI_NUMBER}>
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
      </div>

      <div style={styles.step}>
        <span className="tag" style={{ marginBottom: 10 }}>paso 2</span>
        <p style={{ margin: '0 0 10px', fontWeight: 600 }}>Cuéntanos a dónde enviamos tu pedido:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Tu nombre completo" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
          <input placeholder="Tu número de teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} />
          <input placeholder="Dirección de entrega" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
        </div>
      </div>

      <div style={styles.step}>
        <span className="tag" style={{ marginBottom: 10 }}>paso 3</span>
        <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Envía el comprobante por WhatsApp</p>
        <p style={{ fontSize: 13, opacity: 0.75, margin: '0 0 14px' }}>
          Al tocar el botón se abre WhatsApp con tu pedido ya escrito. Adjunta ahí la foto o captura del comprobante de la transferencia.
        </p>
        <button
          className="btn btn-accent"
          style={{ width: '100%' }}
          onClick={handleSendProof}
          disabled={!configured || !name || !phone || !address}
        >
          Enviar comprobante por WhatsApp
        </button>
      </div>

      <p style={styles.notice}>
        📦 El pedido se despacha únicamente después de recibir y confirmar el comprobante de pago por WhatsApp.
      </p>
    </div>
  )
}

const styles = {
  summary: {
    background: '#fff',
    border: '1px solid rgba(26,20,20,0.08)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 24,
  },
  line: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  step: {
    background: '#fff',
    border: '1px solid rgba(26,20,20,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nequiBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--paper)',
    borderRadius: 10,
    padding: '12px 16px',
  },
  input: {
    padding: '11px 14px',
    borderRadius: 8,
    border: '1.5px solid rgba(26,20,20,0.15)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
  },
  warning: {
    background: '#FCEFE2',
    border: '1px solid var(--marigold)',
    color: 'var(--wine)',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  notice: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.75,
    marginTop: 8,
  },
}
