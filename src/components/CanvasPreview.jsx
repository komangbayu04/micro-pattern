import React, { useRef, useEffect, useCallback, useState } from 'react'
import { generatePattern } from '../lib/pattern.js'

export default function CanvasPreview({ config, onPixelsGenerated, canvasRef, onFreePathChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const [freePath, setFreePath] = useState([])
  const [drawingPath, setDrawingPath] = useState([])
  const lastPointRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { canvasWidth: width, canvasHeight: height } = config
    const dpr = Math.min(window.devicePixelRatio || 1, 3)

    // Render at DPR × logical size for crisp output on all screens
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.scale(dpr, dpr)

    // Fill background
    if (config.backgroundColor === 'transparent') {
      ctx.clearRect(0, 0, width, height)
    } else {
      ctx.fillStyle = config.backgroundColor
      ctx.fillRect(0, 0, width, height)
    }

    // Apply rotation
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
      // Round all coords to integers — eliminates sub-pixel anti-aliasing
      const x = Math.round(p.x - p.size / 2)
      const y = Math.round(p.y - p.size / 2)
      const s = Math.round(p.size)
      ctx.fillRect(x, y, s, s)
    }

    ctx.restore()

    // Free-draw guide path
    if (config.shape === 'Free' && drawingPath.length > 1) {
      ctx.save()
      ctx.strokeStyle = '#e0e0e0'
      ctx.setLineDash([4, 4])
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(drawingPath[0].x, drawingPath[0].y)
      for (let i = 1; i < drawingPath.length; i++) {
        ctx.lineTo(drawingPath[i].x, drawingPath[i].y)
      }
      ctx.stroke()
      ctx.restore()
    }
  }, [config, freePath, drawingPath])

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
    if (pt) {
      setDrawingPath([pt])
      lastPointRef.current = pt
    }
  }, [config.shape, getCanvasPoint])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || config.shape !== 'Free') return
    e.preventDefault()
    const pt = getCanvasPoint(e)
    if (!pt) return
    const last = lastPointRef.current
    if (last) {
      const dx = pt.x - last.x
      const dy = pt.y - last.y
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

  const handleRedraw = () => {
    setFreePath([])
    setDrawingPath([])
    onFreePathChange([])
    lastPointRef.current = null
  }

  const isTransparent = config.backgroundColor === 'transparent'

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-canvas)',
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
            // CSS display size stays at logical resolution — DPR is in the buffer
            width: config.canvasWidth + 'px',
            height: config.canvasHeight + 'px',
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 160px)',
            border: '1px solid var(--color-hairline)',
            cursor: config.shape === 'Free' ? 'crosshair' : 'default',
            // Nearest-neighbor scaling — no blur when CSS shrinks the canvas
            imageRendering: 'pixelated',
            imageRendering: 'crisp-edges',
          }}
        />
      </div>

      {config.shape === 'Free' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span className="caption" style={{ textAlign: 'center' }}>
            Click and drag on the canvas to draw a path
          </span>
          {freePath.length > 0 && (
            <button
              onClick={handleRedraw}
              style={{
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: '0px',
                padding: '6px 16px',
                fontSize: '12px',
                cursor: 'pointer',
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
