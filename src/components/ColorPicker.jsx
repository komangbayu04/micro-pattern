import React, { useRef } from 'react'

const PIXEL_SWATCHES = [
  { color: '#161616', label: 'Charcoal' },
  { color: '#0f62fe', label: 'IBM Blue' },
  { color: '#ffffff', label: 'White' },
  { color: '#8c8c8c', label: 'Gray' },
  { color: '#da1e28', label: 'Red' },
]

const BG_SWATCHES = [
  { color: '#ffffff', label: 'White' },
  { color: '#161616', label: 'Charcoal' },
  { color: '#f4f4f4', label: 'Surface' },
  { color: 'transparent', label: 'Transparent' },
]

export default function ColorPicker({ label, value, onChange, mode = 'pixel' }) {
  const colorInputRef = useRef(null)
  const swatches = mode === 'pixel' ? PIXEL_SWATCHES : BG_SWATCHES

  const isCustom = !swatches.find(s => s.color === value)
  const isTransparent = value === 'transparent'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '14px', fontWeight: 400, color: 'var(--color-ink)' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {swatches.map(s => {
          const active = s.color === value
          return (
            <button
              key={s.color}
              title={s.label}
              onClick={() => onChange(s.color)}
              style={{
                width: '32px',
                height: '32px',
                padding: '0',
                border: active
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-hairline)',
                borderRadius: '0px',
                cursor: 'pointer',
                background: s.color === 'transparent' ? undefined : s.color,
                position: 'relative',
                outline: active ? '1px solid var(--color-primary)' : 'none',
                outlineOffset: active ? '1px' : '0',
              }}
              className={s.color === 'transparent' ? 'checkerboard' : ''}
            />
          )
        })}

        {/* Custom color button */}
        <button
          title="Custom color"
          onClick={() => colorInputRef.current?.click()}
          style={{
            width: '32px',
            height: '32px',
            padding: '0',
            border: isCustom ? '2px solid var(--color-primary)' : '1px solid var(--color-hairline)',
            borderRadius: '0px',
            cursor: 'pointer',
            background: isCustom && !isTransparent ? value : 'var(--color-surface-1)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: 'var(--color-ink-muted)',
          }}
        >
          {(!isCustom || isTransparent) && '+'}
          <input
            ref={colorInputRef}
            type="color"
            value={isCustom && !isTransparent ? value : '#000000'}
            onChange={e => onChange(e.target.value)}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
            }}
          />
        </button>
      </div>
    </div>
  )
}
