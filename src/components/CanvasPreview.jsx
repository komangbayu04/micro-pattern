import React, { useRef, useEffect, useCallback, useState } from 'react'
import { generatePattern } from '../lib/pattern.js'

export default function CanvasPreview({ config, onPixelsGenerated, canvasRef, onFreePathChange }) {
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [freePath, setFreePath] = useState([])
  const [drawingPath, setDrawingPath] = useState([])
  const lastPointRef = useRef(null)

  // Render pattern
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { canvasWidth: width, canvasHeight: height } = config

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')

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
      const half = p.size / 2
      ctx.fillRect(p.x - half, p.y - half, p.size, p.size)
    }

    ctx.restore()

    // Draw free-draw path while dragging
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

  // Convert mouse/touch event to canvas coordinates
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
      <div
        style={{
          position: 'relative',
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 160px)',
            height: 'auto',
            border: '1px solid var(--color-hairline)',
            cursor: config.shape === 'Free' ? 'crosshair' : 'default',
            imageRendering: 'pixelated',
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
