import { generatePattern } from './pattern.js'

// Re-render at exact config resolution (no DPR) for clean export
function renderToOffscreenCanvas(pixels, config) {
  const { width, height, pixelColor, backgroundColor, rotation } = config
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height

  const ctx = offscreen.getContext('2d')
  ctx.imageSmoothingEnabled = false

  if (backgroundColor === 'transparent') {
    ctx.clearRect(0, 0, width, height)
  } else {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }

  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)

  ctx.fillStyle = pixelColor
  for (const p of pixels) {
    const x = Math.round(p.x - p.size / 2)
    const y = Math.round(p.y - p.size / 2)
    const s = Math.round(p.size)
    ctx.fillRect(x, y, s, s)
  }

  ctx.restore()
  return offscreen
}

export function exportPNG(pixels, config, filename = 'pattern.png') {
  const offscreen = renderToOffscreenCanvas(pixels, config)
  offscreen.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

export function exportSVG(pixels, config, filename = 'pattern.svg') {
  const { width, height, pixelColor, backgroundColor } = config

  const bgRect = backgroundColor === 'transparent'
    ? ''
    : `<rect width="${width}" height="${height}" fill="${backgroundColor}"/>`

  const rects = pixels.map(p => {
    const x = Math.round(p.x - p.size / 2)
    const y = Math.round(p.y - p.size / 2)
    const s = Math.round(p.size)
    return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${pixelColor}"/>`
  }).join('\n  ')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bgRect}
  ${rects}
</svg>`

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
