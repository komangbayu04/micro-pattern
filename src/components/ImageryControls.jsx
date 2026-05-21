import React from 'react'
import SliderControl from './SliderControl.jsx'
import { exportMosaicPNG } from '../lib/mosaic.js'

const SHAPES = ['Bead', 'Square', 'Circle', 'Diamond', 'Cross']

const GAP_COLORS = [
  { color: '#1a1a1a', label: 'Dark' },
  { color: '#000000', label: 'Black' },
  { color: '#ffffff', label: 'White' },
  { color: '#f4f4f4', label: 'Light' },
  { color: '#0f62fe', label: 'Blue' },
]

function Section({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span className="eyebrow">{title}</span>
      {children}
    </div>
  )
}

export default function ImageryControls({ config, onConfigChange, canvasRef, hasImage }) {
  const set = key => val => onConfigChange({ ...config, [key]: val })

  const handleExportPNG = () => {
    if (!canvasRef.current) return
    exportMosaicPNG(canvasRef.current)
  }

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

        {/* Tile */}
        <Section title="Tile">
          <SliderControl
            label="Tile size"
            sublabel="Smaller = more detail"
            min={3} max={32} step={1}
            value={config.tileSize}
            onChange={set('tileSize')}
            unit="px"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Shape</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', border: '1px solid var(--color-hairline)' }}>
              {SHAPES.map(s => {
                const active = config.shape === s
                return (
                  <button
                    key={s}
                    onClick={() => set('shape')(s)}
                    style={{
                      flex: '1 1 auto',
                      padding: '7px 6px',
                      fontSize: '11px',
                      fontWeight: active ? 600 : 400,
                      background: active ? 'var(--color-primary)' : 'transparent',
                      color: active ? 'white' : 'var(--color-ink-muted)',
                      border: 'none',
                      borderRadius: '0px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <SliderControl
            label="Gap"
            sublabel="Space between tiles"
            min={0} max={8} step={0.5}
            value={config.gap}
            onChange={set('gap')}
            unit="px"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Gap color</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {GAP_COLORS.map(s => {
                const active = config.gapColor === s.color
                return (
                  <button
                    key={s.color}
                    title={s.label}
                    onClick={() => set('gapColor')(s.color)}
                    style={{
                      width: '28px',
                      height: '28px',
                      background: s.color,
                      border: active
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-hairline-strong)',
                      borderRadius: '0px',
                      cursor: 'pointer',
                      outline: active ? '1px solid var(--color-primary)' : 'none',
                      outlineOffset: '1px',
                    }}
                  />
                )
              })}
            </div>
          </div>
        </Section>

        <div className="divider" />

        {/* Adjustments */}
        <Section title="Adjustments">
          <SliderControl
            label="Saturation"
            sublabel=""
            min={-50} max={100} step={1}
            value={config.saturation}
            onChange={set('saturation')}
          />
          <SliderControl
            label="Contrast"
            sublabel=""
            min={-100} max={100} step={1}
            value={config.contrast}
            onChange={set('contrast')}
          />
          <SliderControl
            label="Brightness"
            sublabel=""
            min={-80} max={80} step={1}
            value={config.brightness}
            onChange={set('brightness')}
          />
        </Section>
      </div>

      {/* Footer */}
      <div style={{
        padding: 'var(--space-md)',
        borderTop: '1px solid var(--color-hairline)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <button
          className="btn-primary"
          onClick={handleExportPNG}
          disabled={!hasImage}
          style={{ opacity: hasImage ? 1 : 0.4, cursor: hasImage ? 'pointer' : 'default' }}
        >
          <DownloadIcon /> Download PNG
        </button>
      </div>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12L3 7h3V2h4v5h3L8 12zM2 14h12v-1H2v1z" />
    </svg>
  )
}
