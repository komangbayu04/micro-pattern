import React, { useRef, useState } from 'react'
import { runAiTribe } from '../lib/falai.js'

const CATEGORIES = [
  { id: 'upper', label: 'Upper' },
  { id: 'lower', label: 'Lower' },
  { id: 'overall', label: 'Full outfit' },
]

export default function AiTribeControls({ personImage, onResultReady }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('fal_api_key') || '')
  const [garmentImage, setGarmentImage] = useState(null)
  const [garmentPreview, setGarmentPreview] = useState(null)
  const [category, setCategory] = useState('overall')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const garmentInputRef = useRef(null)

  const handleGarmentFile = file => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setGarmentImage(img)
      setGarmentPreview(url)
    }
    img.src = url
  }

  const handleGenerate = async () => {
    if (!personImage || !garmentImage || !apiKey) return
    setError(null)
    setStatus('Starting…')
    try {
      localStorage.setItem('fal_api_key', apiKey)
      const resultUrl = await runAiTribe({
        personImage,
        garmentImage,
        category,
        apiKey,
        onProgress: setStatus,
      })
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        onResultReady(img, resultUrl)
        setStatus(null)
      }
      img.src = resultUrl
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setStatus(null)
    }
  }

  const canGenerate = !!personImage && !!garmentImage && !!apiKey && !status

  return (
    <div style={{
      width: '300px',
      minWidth: '300px',
      background: 'var(--color-surface-1)',
      borderLeft: '1px solid var(--color-hairline)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
      }}>

        {/* Header */}
        <div>
          <span className="eyebrow">AI Tribe</span>
          <p style={{ fontSize: '12px', color: 'var(--color-ink-subtle)', marginTop: '6px', lineHeight: 1.5 }}>
            Upload a reference outfit, then generate a virtual try-on on your person photo.
          </p>
        </div>

        {/* API Key */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--color-ink)' }}>
            fal.ai API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your fal.ai key…"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-hairline)',
              color: 'var(--color-ink)',
              fontSize: '12px',
              padding: '8px 10px',
              outline: 'none',
              fontFamily: 'monospace',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--color-ink-subtle)' }}>
            Get a key at fal.ai — saved locally in your browser.
          </span>
        </div>

        <div className="divider" />

        {/* Garment upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="eyebrow">Reference Outfit</span>

          {garmentPreview ? (
            <div style={{ position: 'relative' }}>
              <img
                src={garmentPreview}
                alt="Reference outfit"
                style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  objectFit: 'cover',
                  display: 'block',
                  border: '1px solid var(--color-hairline)',
                }}
              />
              <button
                onClick={() => garmentInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'var(--color-ink-muted)',
                  border: '1px solid var(--color-hairline)',
                  padding: '4px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Replace
              </button>
            </div>
          ) : (
            <div
              onClick={() => garmentInputRef.current?.click()}
              style={{
                width: '100%',
                aspectRatio: '3/4',
                border: '1px dashed var(--color-primary)',
                background: 'rgba(69,137,255,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(69,137,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(69,137,255,0.04)'}
            >
              <UploadIcon />
              <span style={{ fontSize: '12px', color: 'var(--color-ink-subtle)' }}>
                Upload outfit reference
              </span>
            </div>
          )}

          <input
            ref={garmentInputRef}
            type="file"
            accept="image/*"
            onChange={e => handleGarmentFile(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
        </div>

        <div className="divider" />

        {/* Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="eyebrow">Category</span>
          <div style={{ display: 'flex', border: '1px solid var(--color-hairline)' }}>
            {CATEGORIES.map(c => {
              const active = category === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    flex: 1,
                    padding: '7px 6px',
                    fontSize: '11px',
                    fontWeight: active ? 600 : 400,
                    background: active ? 'var(--color-primary)' : 'transparent',
                    color: active ? 'white' : 'var(--color-ink-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Person status */}
        <div style={{
          background: 'var(--color-surface-2)',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: personImage ? '#42be65' : 'var(--color-surface-3)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '12px', color: 'var(--color-ink-subtle)' }}>
            {personImage ? 'Person photo loaded' : 'Upload a person photo on canvas first'}
          </span>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.1)',
            border: '1px solid rgba(255,80,80,0.3)',
            padding: '10px 12px',
            fontSize: '12px',
            color: '#ff8080',
            lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: 'var(--space-md)',
        borderTop: '1px solid var(--color-hairline)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {status && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0',
          }}>
            <Spinner />
            <span style={{ fontSize: '12px', color: 'var(--color-ink-subtle)' }}>{status}</span>
          </div>
        )}
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{ opacity: canGenerate ? 1 : 0.4, cursor: canGenerate ? 'pointer' : 'default' }}
        >
          <SparkleIcon /> Generate Try-On
        </button>
      </div>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 0.8s linear infinite', transformOrigin: '12px 12px' }}/>
    </svg>
  )
}
