import React, { useRef, useEffect, useState, useCallback } from 'react'
import { generateMosaic } from '../lib/mosaic.js'

export default function ImageryView({ image, config, canvasRef, onImageLoad }) {
  const fileInputRef = useRef(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const debounceRef = useRef(null)

  // Generate mosaic when image or config changes
  useEffect(() => {
    if (!image || !canvasRef.current) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setIsProcessing(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          generateMosaic(image, config, canvasRef.current)
          setIsProcessing(false)
        })
      })
    }, 180)
    return () => clearTimeout(debounceRef.current)
  }, [image, config])

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const img = new Image()
    img.onload = () => onImageLoad(img)
    img.src = URL.createObjectURL(file)
  }, [onImageLoad])

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleInputChange = (e) => handleFile(e.target.files?.[0])

  if (!image) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0d0d',
        padding: '40px',
      }}>
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            maxWidth: '480px',
            aspectRatio: '16/9',
            border: '1px dashed var(--color-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            gap: '16px',
            background: 'rgba(69,137,255,0.04)',
            transition: 'background 120ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(69,137,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(69,137,255,0.04)'}
        >
          <UploadIcon />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
              Upload an image
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-ink-subtle)' }}>
              Drag & drop or click — PNG, JPG, WebP
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Bead', 'Square', 'Circle', 'Diamond'].map(s => (
              <div key={s} style={{
                padding: '4px 10px',
                background: 'var(--color-surface-2)',
                fontSize: '11px',
                color: 'var(--color-ink-subtle)',
                letterSpacing: '0.3px',
              }}>{s}</div>
            ))}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </div>
    )
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#0d0d0d',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        height: '40px',
        minHeight: '40px',
        background: 'var(--color-surface-1)',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '8px',
      }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'var(--color-surface-2)',
            color: 'var(--color-ink-muted)',
            border: '1px solid var(--color-hairline)',
            padding: '4px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            borderRadius: '0px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <UploadSmallIcon /> Replace image
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--color-hairline)', margin: '0 4px' }} />

        {/* Original / Mosaic toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--color-hairline)' }}>
          {['Mosaic', 'Original'].map(label => {
            const active = label === 'Mosaic' ? !showOriginal : showOriginal
            return (
              <button
                key={label}
                onClick={() => setShowOriginal(label === 'Original')}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  background: active ? 'var(--color-primary)' : 'transparent',
                  color: active ? 'white' : 'var(--color-ink-subtle)',
                  border: 'none',
                  borderRadius: '0px',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {isProcessing && (
          <span style={{ fontSize: '12px', color: 'var(--color-ink-subtle)', marginLeft: '8px' }}>
            Processing…
          </span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Canvas area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Original image preview (shown when toggle is "Original") */}
        {showOriginal && image && (
          <img
            src={image.src}
            alt="Original"
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 160px)',
              border: '1px solid #393939',
              display: 'block',
            }}
          />
        )}

        {/* Mosaic canvas */}
        <canvas
          ref={canvasRef}
          style={{
            display: showOriginal ? 'none' : 'block',
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 160px)',
            border: '1px solid #393939',
            imageRendering: 'auto',
          }}
        />

        {isProcessing && !showOriginal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(13,13,13,0.55)',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>Generating mosaic…</span>
          </div>
        )}
      </div>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}

function UploadSmallIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}
