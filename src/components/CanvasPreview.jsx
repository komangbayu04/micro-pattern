import React, { useRef, useEffect, useCallback, useState } from 'react'
import { generatePattern } from '../lib/pattern.js'

const FIT_MAP = {
  Cover: 'cover',
  Contain: 'contain',
  Fill: 'fill',
  Tile: 'tile',
}

const BLEND_MAP = {
  Normal: 'source-over',
  Multiply: 'multiply',
  Screen: 'screen',
  Overlay: 'overlay',
  'Soft Light': 'soft-light',
}

function drawImage(ctx, img, width, height, fit) {
  if (fit === 'Tile') {
    const pattern = ctx.createPattern(img, 'repeat')
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, width, height)
    return
  }

  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const canvasAspect = width / height
  const imgAspect = iw / ih
  let sx = 0, sy = 0, sw = iw, sh = ih
  let dx = 0, dy = 0, dw = width, dh = height

  if (fit === 'Cover') {
    if (imgAspect > canvasAspect) {
      sw = ih * canvasAspect
      sx = (iw - sw) / 2
    } else {
      sh = iw / canvasAspect
      sy = (ih - sh) / 2
    }
  } else if (fit === 'Contain') {
    if (imgAspect > canvasAspect) {
      dh = width / imgAspect
      dy = (height - dh) / 2
    } else {
      dw = height * imgAspect
      dx = (width - dw) / 2
    }
  }
  // Fill: stretch, use default dx/dy/dw/dh

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

export default function CanvasPreview({ config, imageConfig, onPixelsGenerated, canvasRef, onFreePathChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const [freePath, setFreePath] = useState([])
  const [drawingPath, setDrawingPath] = useState([])
  const lastPointRef = useRef(null)
  const imgRef = useRef(null)

  // Load reference image
  useEffect(() => {
    if (!imageConfig.src) {
      imgRef.current = null
      return
    }
    const img = new Image()
    img.onload = () => { imgRef.current = img }
    img.src = imageConfig.src
  }, [imageConfig.src])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { canvasWidth: width, canvasHeight: height } = config
    const dpr = Math.min(window.devicePixelRatio || 1, 3)

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.scale(dpr, dpr)

    // 1 — Background color
    if (config.backgroundColor === 'transparent') {
      ctx.clearRect(0, 0, width, height)
    } else {
      ctx.fillStyle = config.backgroundColor
      ctx.fillRect(0, 0, width, height)
    }

    // 2 — Reference image layer
    if (imgRef.current) {
      ctx.save()
      ctx.globalAlpha = imageConfig.opacity
      ctx.globalCompositeOperation = BLEND_MAP[imageConfig.blend] || 'source-over'
      ctx.imageSmoothingEnabled = true
      drawImage(ctx, imgRef.current, width, height, imageConfig.fit)
      ctx.restore()
      ctx.imageSmoothingEnabled = false
    }

    // 3 — Pixel pattern layer
    const centerX = width / 2
    const centerY = height / 2
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((config.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    const effectiveFreePath = config.shape === 'Free' ? freePath : []
    const pixels = generatePattern({ ...config, width, height, freePath: effectiveFreePath })
    onPixelsGenerated(pixels)

    ctx.fillStyle = config.pixelColor
    for (const p of pixels) {
      ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), Math.round(p.size), Math.round(p.size))
    }

    ctx.restore()

    // Free-draw guide path
    if (config.shape === 'Free' && drawingPath.length > 1) {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.setLineDash([4, 4])
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(drawingPath[0].x, drawingPath[0].y)
      for (let i = 1; i < drawingPath.length; i++) ctx.lineTo(drawingPath[i].x, drawingPath[i].y)
      ctx.stroke()
      ctx.restore()
    }
  }, [config, imageConfig, freePath, drawingPath])

  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = config.canvasWidth / rect.width
    const scaleY = config.canvasHeight / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [config.canvasWidth, config.canvasHeight])

  const handleMouseDown = useCallback((e) => {
    if (config.shape !== 'Free') return
    e.preventDefault()
    setIsDragging(true)
    const pt = getCanvasPoint(e)
    if (pt) { setDrawingPath([pt]); lastPointRef.current = pt }
  }, [config.shape, getCanvasPoint])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || config.shape !== 'Free') return
    e.preventDefault()
    const pt = getCanvasPoint(e)
    if (!pt) return
    const last = lastPointRef.current
    if (last) {
      const dx = pt.x - last.x, dy = pt.y - last.y
      if (Math.sqrt(dx * dx + dy * dy) >= 8) {
        setDrawingPath(prev => [...prev, pt])
        lastPointRef.current = pt
      }
    }
  }, [isDragging, config.shape, getCanvasPoint])

  const handleMouseUp = useCallback(() => {
    if (!isDragging || config.shape !== 'Free') return
    setIsDragging(false)
    setFreePath(drawingPath)
    onFreePathChange(drawingPath)
    setDrawingPath([])
    lastPointRef.current = null
  }, [isDragging, config.shape, drawingPath, onFreePathChange])

  const isTransparent = config.backgroundColor === 'transparent'

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0d0d',
      padding: 'var(--space-lg)',
      gap: 'var(--space-md)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'relative',
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className={isTransparent ? 'checkerboard' : ''}
          style={{
            display: 'block',
            width: config.canvasWidth + 'px',
            height: config.canvasHeight + 'px',
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 160px)',
            border: '1px solid #393939',
            cursor: config.shape === 'Free' ? 'crosshair' : 'default',
            // bilinear scaling for display — eliminates white gap artifacts
            // from nearest-neighbor at non-integer scale factors
            imageRendering: 'auto',
          }}
        />
      </div>

      {config.shape === 'Free' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span className="caption">Click and drag on the canvas to draw a path</span>
          {freePath.length > 0 && (
            <button
              onClick={() => { setFreePath([]); setDrawingPath([]); onFreePathChange([]); lastPointRef.current = null }}
              style={{
                background: 'transparent', color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: '0px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer',
              }}
            >
              Clear path & redraw
            </button>
          )}
        </div>
      )}
    </div>
  )
}
