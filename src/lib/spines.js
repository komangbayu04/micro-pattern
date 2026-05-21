// Returns an array of {x, y} points defining the shape's spine
export function computeSpine(shape, width, height, freePath) {
  switch (shape) {
    case 'Diagonal':
      return linePath(width * 0.1, height * 0.9, width * 0.9, height * 0.1, 80)
    case 'Horizontal':
      return linePath(width * 0.1, height * 0.5, width * 0.9, height * 0.5, 80)
    case 'Vertical':
      return linePath(width * 0.5, height * 0.1, width * 0.5, height * 0.9, 80)
    case 'Radial':
      return [{ x: width * 0.5, y: height * 0.5 }]
    case 'Arc':
      return bezierPath(
        { x: width * 0.1, y: height * 0.7 },
        { x: width * 0.5, y: height * 0.1 },
        { x: width * 0.9, y: height * 0.7 },
        80
      )
    case 'Free':
      return freePath && freePath.length > 1 ? freePath : linePath(width * 0.1, height * 0.9, width * 0.9, height * 0.1, 80)
    default:
      return linePath(width * 0.1, height * 0.9, width * 0.9, height * 0.1, 80)
  }
}

function linePath(x1, y1, x2, y2, steps) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t })
  }
  return pts
}

function bezierPath(p0, p1, p2, steps) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    pts.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    })
  }
  return pts
}

// Interpolate spine position at t in [0,1]
export function interpolateSpine(spine, t) {
  if (spine.length === 1) return spine[0]
  const idx = t * (spine.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, spine.length - 1)
  const frac = idx - lo
  return {
    x: spine[lo].x + (spine[hi].x - spine[lo].x) * frac,
    y: spine[lo].y + (spine[hi].y - spine[lo].y) * frac,
  }
}
