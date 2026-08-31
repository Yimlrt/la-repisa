// Traduce nombres de color escritos en español (como los escribiría tu mamá)
// a un color visual aproximado, para mostrar el círculo de color.
const COLOR_MAP = {
  rojo: '#C0392B',
  azul: '#2E5C8A',
  'azul claro': '#7FA8D0',
  'azul oscuro': '#1B3A5C',
  verde: '#3E7A4C',
  'verde claro': '#8FC98F',
  negro: '#1A1A1A',
  blanco: '#F5F5F0',
  gris: '#8C8C8C',
  rosado: '#E39CB0',
  rosa: '#E39CB0',
  fucsia: '#C2286B',
  amarillo: '#E0B23D',
  cafe: '#6B4423',
  café: '#6B4423',
  marron: '#6B4423',
  marrón: '#6B4423',
  morado: '#6E4A8C',
  violeta: '#6E4A8C',
  lila: '#B79FCB',
  naranja: '#D97B3F',
  beige: '#D8CBB0',
  crema: '#EFE6D3',
  dorado: '#C9A44C',
  plateado: '#B8B8B8',
  vinotinto: '#5C1F2E',
  vino: '#5C1F2E',
  turquesa: '#3FA9A0',
  celeste: '#8FCFE0',
  mostaza: '#C9A227',
  khaki: '#A79A6E',
  caqui: '#A79A6E',
}

export function colorToHex(name) {
  if (!name) return null
  const key = name.trim().toLowerCase()
  return COLOR_MAP[key] || null
}
