import { mulberry32 } from './prng.js'
import { computeSpine, interpolateSpine } from './spines.js'

// Box-Muller transform to get Gaussian sample using seeded PRNG
function gaussianSample(rand, mean, std) {
  let u1, u2
  do { u1 = rand() } while (u1 === 0)
  u2 = rand()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * std
}

export function generatePattern(config) {
  const rand = mulberry32(config.seed)
  const { width, height, shape, pixelCount, pixelSize, sizeVariance,
          spreadRadius, coreDensity, snapToGrid, freePath } = config

  const spine = computeSpine(shape, width, height, freePath)
  const pixels = []

  for (let i = 0; i < pixelCount; i++) {
    const t = rand()
    const spinePoint = interpolateSpine(spine, t)

    let distance = Math.abs(gaussianSample(rand, 0, spreadRadius))

    if (rand() < coreDensity) {
      distance = distance * (1 - coreDensity * 0.7)
    }

    const angle = rand() * 2 * Math.PI
    let x = spinePoint.x + Math.cos(angle) * distance
    let y = spinePoint.y + Math.sin(angle) * distance

    // Size with variance
    let size = pixelSize
    if (sizeVariance > 0) {
      size = pixelSize * (1 - sizeVariance + rand() * sizeVariance * 2)
      size = Math.max(2, Math.round(size))
    }

    if (snapToGrid && pixelSize > 0) {
      x = Math.round(x / pixelSize) * pixelSize
      y = Math.round(y / pixelSize) * pixelSize
    }

    // Keep pixel within bounds
    if (x >= 0 && x < width && y >= 0 && y < height) {
      pixels.push({ x, y, size })
    }
  }

  return pixels
}
