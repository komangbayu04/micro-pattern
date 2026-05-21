function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h, s, l]
}

function hslToRgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ]
}

function adjustColor(r, g, b, saturation, contrast, brightness) {
  r = clamp(r + brightness, 0, 255)
  g = clamp(g + brightness, 0, 255)
  b = clamp(b + brightness, 0, 255)

  if (contrast !== 0) {
    const f = (259 * (contrast + 255)) / (255 * (259 - contrast))
    r = clamp(Math.round(f * (r - 128) + 128), 0, 255)
    g = clamp(Math.round(f * (g - 128) + 128), 0, 255)
    b = clamp(Math.round(f * (b - 128) + 128), 0, 255)
  }

  if (saturation !== 0) {
    const [h, s, l] = rgbToHsl(r, g, b)
    const newS = clamp(s + saturation / 100, 0, 1);
    [r, g, b] = hslToRgb(h, newS, l)
  }

  return [r, g, b]
}

export const MOSAIC_DEFAULTS = {
  tileSize: 8,
  shape: 'Bead',
  gap: 1,
  gapColor: '#1a1a1a',
  saturation: 20,
  contrast: 15,
  brightness: 0,
}

const MAX_DIM = 1400

export function generateMosaic(imgEl, config, outputCanvas) {
  const { tileSize, shape, gap, gapColor, saturation, contrast, brightness } = config

  // Scale source image for performance
  let srcW = imgEl.naturalWidth, srcH = imgEl.naturalHeight
  if (srcW > MAX_DIM || srcH > MAX_DIM) {
    const scale = MAX_DIM / Math.max(srcW, srcH)
    srcW = Math.round(srcW * scale)
    srcH = Math.round(srcH * scale)
  }

  // Sample source pixels
  const tmp = document.createElement('canvas')
  tmp.width = srcW; tmp.height = srcH
  const tmpCtx = tmp.getContext('2d')
  tmpCtx.drawImage(imgEl, 0, 0, srcW, srcH)
  const { data } = tmpCtx.getImageData(0, 0, srcW, srcH)

  // Setup output
  outputCanvas.width = srcW
  outputCanvas.height = srcH
  const ctx = outputCanvas.getContext('2d')
  ctx.fillStyle = gapColor
  ctx.fillRect(0, 0, srcW, srcH)

  const cols = Math.ceil(srcW / tileSize)
  const rows = Math.ceil(srcH / tileSize)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * tileSize
      const py = row * tileSize
      const tw = Math.min(tileSize, srcW - px)
      const th = Math.min(tileSize, srcH - py)

      // Average color for this tile
      let r = 0, g = 0, b = 0, n = 0
      for (let dy = 0; dy < th; dy++) {
        for (let dx = 0; dx < tw; dx++) {
          const i = ((py + dy) * srcW + (px + dx)) * 4
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++
        }
      }
      r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n)
      ;[r, g, b] = adjustColor(r, g, b, saturation, contrast, brightness)

      const cx = px + tileSize / 2
      const cy = py + tileSize / 2
      const radius = Math.max(0.5, (tileSize - gap) / 2)

      ctx.fillStyle = `rgb(${r},${g},${b})`

      if (shape === 'Square') {
        ctx.fillRect(px + gap / 2, py + gap / 2, tileSize - gap, tileSize - gap)

      } else if (shape === 'Circle') {
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()

      } else if (shape === 'Bead') {
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()
        // Sphere highlight
        const grd = ctx.createRadialGradient(
          cx - radius * 0.28, cy - radius * 0.28, radius * 0.04,
          cx + radius * 0.1, cy + radius * 0.1, radius * 1.1
        )
        grd.addColorStop(0, 'rgba(255,255,255,0.52)')
        grd.addColorStop(0.4, 'rgba(255,255,255,0.08)')
        grd.addColorStop(1, 'rgba(0,0,0,0.18)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()

      } else if (shape === 'Diamond') {
        const r2 = radius * 1.08
        ctx.beginPath()
        ctx.moveTo(cx, cy - r2)
        ctx.lineTo(cx + r2, cy)
        ctx.lineTo(cx, cy + r2)
        ctx.lineTo(cx - r2, cy)
        ctx.closePath()
        ctx.fill()

      } else if (shape === 'Cross') {
        const t = Math.max(1, radius * 0.38)
        ctx.fillRect(cx - t, cy - radius, t * 2, radius * 2)
        ctx.fillRect(cx - radius, cy - t, radius * 2, t * 2)
      }
    }
  }

  return outputCanvas
}

export function exportMosaicPNG(canvas, filename = 'mosaic.png') {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
