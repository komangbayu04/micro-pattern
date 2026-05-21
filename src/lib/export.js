import { generatePattern } from './pattern.js'

const BLEND_MAP = {
  Normal: 'source-over',
  Multiply: 'multiply',
  Screen: 'screen',
  Overlay: 'overlay',
  'Soft Light': 'soft-light',
}

function drawImageLayer(ctx, imgEl, width, height, fit) {
  if (!imgEl) return
  if (fit === 'Tile') {
    const pat = ctx.createPattern(imgEl, 'repeat')
    ctx.fillStyle = pat
    ctx.fillRect(0, 0, width, height)
    return
  }
  const iw = imgEl.naturalWidth, ih = imgEl.naturalHeight
  const canvasAspect = width / height, imgAspect = iw / ih
  let sx = 0, sy = 0, sw = iw, sh = ih, dx = 0, dy = 0, dw = width, dh = height
  if (fit === 'Cover') {
    if (imgAspect > canvasAspect) { sw = ih * canvasAspect; sx = (iw - sw) / 2 }
    else { sh = iw / canvasAspect; sy = (ih - sh) / 2 }
  } else if (fit === 'Contain') {
    if (imgAspect > canvasAspect) { dh = width / imgAspect; dy = (height - dh) / 2 }
    else { dw = height * imgAspect; dx = (width - dw) / 2 }
  }
  ctx.drawImage(imgEl, sx, sy, sw, sh, dx, dy, dw, dh)
}

function renderOffscreen(pixels, config, imageConfig, imgEl) {
  const { width, height, pixelColor, backgroundColor, rotation } = config
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')
  ctx.imageSmoothingEnabled = false

  // Background
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }

  // Image layer
  if (imgEl) {
    ctx.save()
    ctx.globalAlpha = imageConfig.opacity
    ctx.globalCompositeOperation = BLEND_MAP[imageConfig.blend] || 'source-over'
    ctx.imageSmoothingEnabled = true
    drawImageLayer(ctx, imgEl, width, height, imageConfig.fit)
    ctx.restore()
    ctx.imageSmoothingEnabled = false
  }

  // Pixel layer
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)
  ctx.fillStyle = pixelColor
  for (const p of pixels) {
    ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), Math.round(p.size), Math.round(p.size))
  }
  ctx.restore()

  return offscreen
}

export function exportPNG(pixels, config, imageConfig = {}, imgEl = null, filename = 'pattern.png') {
  const offscreen = renderOffscreen(pixels, config, imageConfig, imgEl)
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
