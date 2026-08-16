import React from 'react'
import { Link } from 'react-router-dom'

export default function OrderPending() {
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <span className="tag" style={{ marginBottom: 16 }}>pedido registrado</span>
      <h1 style={{ fontSize: 28, margin: '14px 0 10px' }}>¡Ya casi! Confirma tu comprobante por WhatsApp</h1>
      <p style={{ opacity: 0.75, maxWidth: 440, margin: '0 auto 8px' }}>
        Tu pedido quedó anotado, pero <strong>todavía no se despacha</strong>. En cuanto enviemos y confirmemos
        el comprobante de tu transferencia por WhatsApp, empezamos a alistarlo.
      </p>
      <p style={{ opacity: 0.6, maxWidth: 440, margin: '0 auto 24px', fontSize: 14 }}>
        Si cerraste WhatsApp sin enviar la captura de la transferencia, no te preocupes: solo escríbenos de nuevo
        con tu foto del comprobante y el número de pedido.
      </p>
      <Link to="/" className="btn btn-primary">Seguir viendo productos</Link>
    </div>
  )
}
