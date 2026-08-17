// Rota una imagen (File o Blob) un múltiplo de 90 grados usando un canvas,
// y devuelve un nuevo File con los píxeles ya rotados de verdad (no solo con CSS).
export async function rotateImageFile(file, degrees) {
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  const rad = (degrees * Math.PI) / 180
  const swap = degrees % 180 !== 0

  canvas.width = swap ? img.height : img.width
  canvas.height = swap ? img.width : img.height

  const ctx = canvas.getContext('2d')
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(rad)
  ctx.drawImage(img, -img.width / 2, -img.height / 2)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('No se pudo procesar la imagen'))
        resolve(new File([blob], file.name || 'foto.jpg', { type: file.type || 'image/jpeg' }))
      },
      file.type || 'image/jpeg',
      0.92
    )
  })
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Descarga una imagen ya subida (URL pública) y la convierte en File, para poder rotarla.
export async function urlToFile(url, filename = 'foto.jpg') {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}
