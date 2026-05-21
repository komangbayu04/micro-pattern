import React, { useRef } from 'react'

const FIT_OPTIONS = ['Cover', 'Contain', 'Fill', 'Tile']
const BLEND_OPTIONS = ['Normal', 'Multiply', 'Screen', 'Overlay', 'Soft Light']

function Section({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span className="eyebrow">{title}</span>
      {children}
    </div>
  )
}

export default function ImagePanel({ imageConfig, onImageChange }) {
  const fileInputRef = useRef(null)

  const set = (key) => (val) => onImageChange({ ...imageConfig, [key]: val })

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onImageChange({ ...imageConfig, src: url, name: file.name })
    e.target.value = ''
  }

  const handleClear = () => {
    if (imageConfig.src) URL.revokeObjectURL(imageConfig.src)
    onImageChange({ src: null, name: null, opacity: 1.0, fit: 'Cover', blend: 'Normal' })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    onImageChange({ ...imageConfig, src: url, name: file.name })
  }

  return (
    <div style={{
      width: '240px',
      minWidth: '240px',
      background: 'var(--color-surface-1)',
      borderRight: '1px solid var(--color-hairline)',
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

        <Section title="Background Image">
          {/* Drop zone / Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !imageConfig.src && fileInputRef.current?.click()}
            style={{
              border: `1px dashed ${imageConfig.src ? 'var(--color-surface-3)' : 'var(--color-primary)'}`,
              background: 'var(--color-surface-2)',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: imageConfig.src ? 'default' : 'pointer',
              position: 'relative',
              overflow: 'hidden',
              gap: '8px',
            }}
          >
            {imageConfig.src ? (
              <>
                <img
                  src={imageConfig.src}
                  alt="Reference"
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.6)',
                  padding: '4px 8px',
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: '#c6c6c6',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}>
                    {imageConfig.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <UploadIcon />
                <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)', textAlign: 'center', padding: '0 8px' }}>
                  Click or drag image here
                </span>
                <span className="caption" style={{ textAlign: 'center', padding: '0 8px' }}>
                  PNG, JPG, WebP, SVG
                </span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {imageConfig.src ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1,
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-hairline-strong)',
                  padding: '7px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderRadius: '0px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <ReplaceIcon /> Replace
              </button>
              <button
                onClick={handleClear}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: 'var(--color-danger)',
                  border: '1px solid var(--color-danger)',
                  padding: '7px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderRadius: '0px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <TrashIcon /> Clear
              </button>
            </div>
          ) : null}
        </Section>

        {imageConfig.src && (
          <>
            <div className="divider" />

            <Section title="Image Settings">
              {/* Opacity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Opacity</label>
                  <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>
                    {Math.round(imageConfig.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0} max={1} step={0.01}
                  value={imageConfig.opacity}
                  onChange={e => set('opacity')(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${imageConfig.opacity * 100}%, var(--color-surface-2) ${imageConfig.opacity * 100}%, var(--color-surface-2) 100%)`,
                  }}
                />
              </div>

              {/* Fit mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Fit</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', border: '1px solid var(--color-hairline)' }}>
                  {FIT_OPTIONS.map(opt => {
                    const active = imageConfig.fit === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => set('fit')(opt)}
                        style={{
                          flex: '1 1 auto',
                          padding: '5px 6px',
                          fontSize: '11px',
                          fontWeight: active ? 600 : 400,
                          background: active ? 'var(--color-primary)' : 'transparent',
                          color: active ? 'white' : 'var(--color-ink-muted)',
                          border: 'none',
                          borderRadius: '0px',
                          cursor: 'pointer',
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Blend mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Blend</label>
                <select
                  value={imageConfig.blend}
                  onChange={e => set('blend')(e.target.value)}
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '13px',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-ink)',
                    border: 'none',
                    borderBottom: '1px solid var(--color-hairline-strong)',
                    padding: '6px 8px',
                    outline: 'none',
                    cursor: 'pointer',
                    borderRadius: '0px',
                    width: '100%',
                  }}
                >
                  {BLEND_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </Section>
          </>
        )}

        {!imageConfig.src && (
          <>
            <div className="divider" />
            <Section title="How to use">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ['1', 'Upload a reference image'],
                  ['2', 'Adjust opacity & blend mode'],
                  ['3', 'Layer pixel pattern on top'],
                  ['4', 'Export as PNG or SVG'],
                ].map(([n, text]) => (
                  <div key={n} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-ink-muted)',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>{n}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
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

function ReplaceIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
    </svg>
  )
}
