import React, { useRef, useEffect, useState, useCallback } from 'react'
import { generateMosaic } from '../lib/mosaic.js'

const TOOLS = [
  { id: 'mosaic', label: 'Texture', icon: MosaicIcon },
  { id: 'ai-tribe', label: 'AI Tribe', icon: SparkleIcon },
]

export default function ImageryView({ image, config, canvasRef, onImageLoad, activeTool, onToolChange, aiResult }) {
  const fileInputRef = useRef(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const debounceRef = useRef(null)

  // Generate mosaic when image or config changes (only in mosaic mode)
  useEffect(() => {
    if (!image || !canvasRef.current || activeTool !== 'mosaic') return
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
  }, [image, config, activeTool])

  // Render AI result to canvas
  useEffect(() => {
    if (!aiResult || !canvasRef.current || activeTool !== 'ai-tribe') return
    const canvas = canvasRef.current
    canvas.width = aiResult.naturalWidth
    canvas.height = aiResult.naturalHeight
    canvas.getContext('2d').drawImage(aiResult, 0, 0)
  }, [aiResult, activeTool])

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
      {/* Top toolbar */}
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
          <UploadSmallIcon /> Replace
        </button>

        {activeTool === 'mosaic' && (
          <>
            <div style={{ width: '1px', height: '20px', background: 'var(--color-hairline)', margin: '0 4px' }} />
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
          </>
        )}

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

        {/* Floating toolbar — Figma style */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-surface-1)',
          border: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'stretch',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          zIndex: 10,
        }}>
          {TOOLS.map((tool, i) => {
            const active = activeTool === tool.id
            const Icon = tool.icon
            return (
              <React.Fragment key={tool.id}>
                {i > 0 && (
                  <div style={{ width: '1px', background: 'var(--color-hairline)', alignSelf: 'stretch' }} />
                )}
                <button
                  onClick={() => onToolChange(tool.id)}
                  title={tool.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 18px',
                    background: active ? 'var(--color-primary)' : 'transparent',
                    color: active ? 'white' : 'var(--color-ink-subtle)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 80ms, color 80ms',
                    minWidth: '64px',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-ink)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-ink-subtle)' } }}
                >
                  <Icon active={active} />
                  <span style={{ fontSize: '10px', letterSpacing: '0.3px', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                    {tool.label}
                  </span>
                </button>
              </React.Fragment>
            )
          })}
        </div>

        {/* Original image preview (mosaic mode only) */}
        {showOriginal && activeTool === 'mosaic' && image && (
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

        {/* Main canvas */}
        <canvas
          ref={canvasRef}
          style={{
            display: (showOriginal && activeTool === 'mosaic') ? 'none' : 'block',
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 160px)',
            border: '1px solid #393939',
            imageRendering: 'auto',
          }}
        />

        {/* AI Tribe hint overlay when no result yet */}
        {activeTool === 'ai-tribe' && !aiResult && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(13,13,13,0.72)',
            pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <SparkleIcon size={28} active={false} />
              <span style={{ fontSize: '13px', color: 'var(--color-ink-subtle)' }}>
                Set up AI Tribe in the panel →
              </span>
            </div>
          </div>
        )}

        {isProcessing && !showOriginal && activeTool === 'mosaic' && (
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

function MosaicIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={active ? 'white' : 'currentColor'}>
      <rect x="1" y="1" width="6" height="6" />
      <rect x="9" y="1" width="6" height="6" />
      <rect x="1" y="9" width="6" height="6" />
      <rect x="9" y="9" width="6" height="6" />
    </svg>
  )
}

function SparkleIcon({ active, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'white' : 'currentColor'}>
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" />
      <path d="M19 2l1.09 2.91L23 6l-2.91 1.09L19 10l-1.09-2.91L15 6l2.91-1.09z" opacity="0.55" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function UploadSmallIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
