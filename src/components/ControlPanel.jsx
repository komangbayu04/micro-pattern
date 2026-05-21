import React from 'react'
import SliderControl from './SliderControl.jsx'
import SegmentedControl from './SegmentedControl.jsx'
import ColorPicker from './ColorPicker.jsx'
import ExportButtons from './ExportButtons.jsx'
import { randomSeed } from '../lib/prng.js'

const SHAPES = ['Diagonal', 'Horizontal', 'Vertical', 'Radial', 'Arc', 'Free']

const DEFAULTS = {
  shape: 'Diagonal',
  pixelSize: 12,
  sizeVariance: 0.4,
  pixelCount: 300,
  spreadRadius: 60,
  coreDensity: 0.6,
  pixelColor: '#161616',
  backgroundColor: '#ffffff',
  canvasWidth: 800,
  canvasHeight: 400,
  rotation: 0,
  snapToGrid: true,
}

function Section({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span className="eyebrow">{title}</span>
      {children}
    </div>
  )
}

export default function ControlPanel({ config, onConfigChange, pixels, imageConfig, imgRef, onRandomize, onReset }) {
  const set = (key) => (val) => onConfigChange({ [key]: val })

  const handleAspectWidth = (w) => {
    if (config.aspectLock) {
      const ratio = config.canvasHeight / config.canvasWidth
      onConfigChange({ canvasWidth: w, canvasHeight: Math.round(w * ratio) })
    } else {
      onConfigChange({ canvasWidth: w })
    }
  }

  const handleAspectHeight = (h) => {
    if (config.aspectLock) {
      const ratio = config.canvasWidth / config.canvasHeight
      onConfigChange({ canvasHeight: h, canvasWidth: Math.round(h * ratio) })
    } else {
      onConfigChange({ canvasHeight: h })
    }
  }

  return (
    <div style={{
      width: '320px',
      minWidth: '320px',
      background: 'var(--color-surface-1)',
      borderRight: '1px solid var(--color-hairline)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Scrollable content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
      }}>
        {/* Shape */}
        <Section title="Shape">
          <SegmentedControl options={SHAPES} value={config.shape} onChange={set('shape')} />
        </Section>

        <div className="divider" />

        {/* Pixel size */}
        <Section title="Pixel">
          <SliderControl
            label="Pixel size"
            sublabel="Each square's side length in output pixels"
            min={2} max={48} step={1}
            value={config.pixelSize}
            onChange={set('pixelSize')}
            unit="px"
          />
          <SliderControl
            label="Size variance"
            sublabel="0 = uniform · 1 = chaotic mix"
            min={0} max={1} step={0.05}
            value={config.sizeVariance}
            onChange={set('sizeVariance')}
          />
        </Section>

        <div className="divider" />

        {/* Distribution */}
        <Section title="Distribution">
          <SliderControl
            label="Pixel count"
            sublabel="Total squares in the pattern"
            min={10} max={2000} step={10}
            value={config.pixelCount}
            onChange={set('pixelCount')}
          />
          <SliderControl
            label="Spread radius"
            sublabel="Gaussian falloff distance from shape spine (px)"
            min={0} max={200} step={1}
            value={config.spreadRadius}
            onChange={set('spreadRadius')}
            unit="px"
          />
          <SliderControl
            label="Core density"
            sublabel="Higher = more pixels near spine, fewer satellites"
            min={0} max={1} step={0.05}
            value={config.coreDensity}
            onChange={set('coreDensity')}
          />
        </Section>

        <div className="divider" />

        {/* Color */}
        <Section title="Color">
          <ColorPicker label="Pixel color" value={config.pixelColor} onChange={set('pixelColor')} mode="pixel" />
          <ColorPicker label="Background" value={config.backgroundColor} onChange={set('backgroundColor')} mode="background" />
        </Section>

        <div className="divider" />

        {/* Canvas size */}
        <Section title="Canvas">
          <label style={{ fontSize: '14px', fontWeight: 400 }}>Canvas size</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              min={100} max={4000}
              value={config.canvasWidth}
              onChange={e => handleAspectWidth(parseInt(e.target.value) || 800)}
              style={{ width: '80px' }}
            />
            <span style={{ color: 'var(--color-ink-muted)', fontSize: '14px' }}>×</span>
            <input
              type="number"
              min={100} max={4000}
              value={config.canvasHeight}
              onChange={e => handleAspectHeight(parseInt(e.target.value) || 400)}
              style={{ width: '80px' }}
            />
            <button
              title={config.aspectLock ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              onClick={() => onConfigChange({ aspectLock: !config.aspectLock })}
              style={{
                width: '32px',
                height: '32px',
                padding: '0',
                background: config.aspectLock ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: config.aspectLock ? 'white' : 'var(--color-ink)',
                border: '1px solid var(--color-hairline)',
                borderRadius: '0px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LinkIcon locked={config.aspectLock} />
            </button>
          </div>

          <SliderControl
            label="Rotation"
            sublabel=""
            min={-180} max={180} step={1}
            value={config.rotation}
            onChange={set('rotation')}
            unit="°"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="snapToGrid"
              checked={config.snapToGrid}
              onChange={e => onConfigChange({ snapToGrid: e.target.checked })}
            />
            <label htmlFor="snapToGrid" style={{ fontSize: '14px', cursor: 'pointer' }}>
              Snap to grid
            </label>
          </div>
        </Section>

        <div className="divider" />

        {/* Seed */}
        <Section title="Seed">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              value={config.seed}
              onChange={e => {
                const v = parseInt(e.target.value)
                if (!isNaN(v)) onConfigChange({ seed: v })
              }}
              style={{ flex: 1 }}
            />
            <button
              title="Generate new seed"
              onClick={() => onConfigChange({ seed: randomSeed() })}
              style={{
                width: '36px',
                height: '36px',
                padding: '0',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-hairline)',
                borderRadius: '0px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ink)',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              <DiceIcon />
            </button>
          </div>
          <span className="caption">Same seed + settings = same pattern</span>
        </Section>
      </div>

      {/* Actions footer */}
      <div style={{
        padding: 'var(--space-md)',
        borderTop: '1px solid var(--color-hairline)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'var(--color-surface-1)',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={onRandomize}
            style={{ flex: 1 }}
          >
            Randomize
          </button>
          <button
            className="btn-ghost"
            onClick={onReset}
            style={{ flex: 1 }}
          >
            Reset defaults
          </button>
        </div>
        <div className="divider" />
        <ExportButtons
          pixels={pixels}
          config={{
            width: config.canvasWidth,
            height: config.canvasHeight,
            pixelColor: config.pixelColor,
            backgroundColor: config.backgroundColor,
            rotation: config.rotation,
          }}
          imageConfig={imageConfig}
          imgRef={imgRef}
        />
      </div>
    </div>
  )
}

function LinkIcon({ locked }) {
  return locked ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a3 3 0 0 0-3 3v1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1V4a3 3 0 0 0-3-3zm0 1a2 2 0 0 1 2 2v1H6V4a2 2 0 0 1 2-2zm0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a3 3 0 0 0-3 3v1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1V4a3 3 0 0 0-3-3zm0 1a2 2 0 0 1 2 2v1H9V4a1 1 0 0 0-2 0v1H6V4a2 2 0 0 1 2-2zm0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" opacity=".4"/>
      <path d="M11 5h1V4a4 4 0 0 0-3-3.87V1a3 3 0 0 1 3 3v1z" opacity=".4"/>
    </svg>
  )
}

function DiceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13 1H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zM3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
      <circle cx="5" cy="5" r="1"/>
      <circle cx="8" cy="8" r="1"/>
      <circle cx="11" cy="11" r="1"/>
      <circle cx="11" cy="5" r="1"/>
      <circle cx="5" cy="11" r="1"/>
    </svg>
  )
}

export { DEFAULTS }
