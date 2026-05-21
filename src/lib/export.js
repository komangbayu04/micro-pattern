export function exportPNG(canvas, filename = 'pattern.png') {
  canvas.toBlob((blob) => {
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
    const half = p.size / 2
    return `<rect x="${(p.x - half).toFixed(1)}" y="${(p.y - half).toFixed(1)}" width="${p.size}" height="${p.size}" fill="${pixelColor}"/>`
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
