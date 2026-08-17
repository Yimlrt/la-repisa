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
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Tu carrito está vacío.</p>
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
      `Nombre: ${name}\nTeléfono: ${phone}\nDirección de entrega: ${address}\n\n` +
      `Ya hice la transferencia por Nequi, adjunto el comprobante.`

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    clearCart()
    navigate('/pedido-registrado')
  }

  return (
    <div className="container" style={{ padding: '48px 24px 100px', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>Finalizar pedido</h1>
        <Link to="/carrito" className="close-link">✕ Cerrar</Link>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 40 }}>Referencia de pedido {reference}</p>

      <div style={styles.summary}>
        {items.map((i) => (
          <div key={i.id} style={styles.line}>
            <span style={{ fontSize: 13 }}>{i.qty} × {i.name}</span>
            <span style={{ fontSize: 13 }}>{formatCOP(i.price * i.qty)}</span>
          </div>
        ))}
        <div style={{ ...styles.line, borderTop: '1px solid var(--ink)', paddingTop: 12, marginTop: 4 }}>
          <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</span>
          <span style={{ fontSize: 17, fontWeight: 500 }}>{formatCOP(total)}</span>
        </div>
      </div>

      {!configured && (
        <p style={styles.warning}>
          Falta configurar VITE_NEQUI_NUMBER y VITE_WHATSAPP_NUMBER en el archivo .env para habilitar este paso.
        </p>
      )}

      <div style={styles.stepper}>
        <div style={styles.step}>
          <div style={styles.stepHead}>
            <span style={styles.stepNum}>1</span>
            <p style={styles.stepTitle}>Transferir por Nequi</p>
          </div>
          <div style={styles.stepBody}>
            <div style={styles.nequiBox}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 19, margin: 0, letterSpacing: '0.02em' }}>
                  {NEQUI_NUMBER || '—'}
                </p>
                {NEQUI_HOLDER && <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0' }}>{NEQUI_HOLDER}</p>}
              </div>
              <button type="button" className="btn btn-outline" onClick={copyNumber} disabled={!NEQUI_NUMBER}>
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p style={styles.stepNote}>Transfiere exactamente {formatCOP(total)} a este número.</p>
          </div>
        </div>

        <div style={styles.step}>
          <div style={styles.stepHead}>
            <span style={styles.stepNum}>2</span>
            <p style={styles.stepTitle}>Datos de entrega</p>
          </div>
          <div style={{ ...styles.stepBody, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
            <input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} />
            <input placeholder="Dirección de entrega" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.step}>
          <div style={styles.stepHead}>
            <span style={styles.stepNum}>3</span>
            <p style={styles.stepTitle}>Confirmar por WhatsApp</p>
          </div>
          <div style={styles.stepBody}>
            <p style={styles.stepNote}>
              Se abrirá WhatsApp con tu pedido ya escrito. Adjunta ahí la foto del comprobante de la transferencia.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 14 }}
              onClick={handleSendProof}
              disabled={!configured || !name || !phone || !address}
            >
              Enviar comprobante por WhatsApp
            </button>
          </div>
        </div>
      </div>

      <p style={styles.footNote}>
        Tu pedido se despacha únicamente después de confirmar el comprobante de pago por WhatsApp.
      </p>
    </div>
  )
}

const styles = {
  summary: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 },
  line: { display: 'flex', justifyContent: 'space-between' },
  warning: {
    fontSize: 12.5,
    color: 'var(--muted)',
    border: '1px solid var(--line)',
    padding: 12,
    marginBottom: 20,
  },
  stepper: { display: 'flex', flexDirection: 'column' },
  step: { borderTop: '1px solid var(--line)', padding: '24px 0' },
  stepHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  stepNum: {
    width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--ink)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontFamily: 'var(--font-mono)', flexShrink: 0,
  },
  stepTitle: { fontSize: 15, fontWeight: 500, margin: 0 },
  stepBody: { paddingLeft: 36 },
  nequiBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    border: '1px solid var(--line)', padding: '14px 18px',
  },
  stepNote: { fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 },
  input: {
    padding: '12px 0',
    border: 'none',
    borderBottom: '1px solid var(--line)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    background: 'transparent',
  },
  footNote: { fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 },
}
