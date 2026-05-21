import React, { useRef, useState, useCallback } from 'react'
import ControlPanel, { DEFAULTS } from './components/ControlPanel.jsx'
import CanvasPreview from './components/CanvasPreview.jsx'
import FeatureSidebar from './components/FeatureSidebar.jsx'
import { randomSeed } from './lib/prng.js'

const DEFAULT_IMAGE_CONFIG = {
  src: null,
  name: null,
  opacity: 1.0,
  fit: 'Cover',
  blend: 'Normal',
}

function getInitialConfig() {
  return { ...DEFAULTS, seed: randomSeed(), aspectLock: false }
}

function ComingSoon() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0d0d',
      gap: '16px',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: 'var(--color-surface-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="var(--color-ink-subtle)" strokeWidth="1.5">
          <rect x="1" y="1" width="14" height="14"/>
          <circle cx="5.5" cy="5.5" r="1.5"/>
          <path d="M1 10l4-4 3 3 2-2 5 5"/>
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
          Imagery
        </span>
        <span style={{ fontSize: '13px', color: 'var(--color-ink-subtle)', textAlign: 'center', maxWidth: '280px' }}>
          AI-powered image generation is coming in the next release.
        </span>
      </div>
      <div style={{
        padding: '6px 16px',
        border: '1px solid var(--color-surface-3)',
        fontSize: '12px',
        color: 'var(--color-ink-subtle)',
        letterSpacing: '0.5px',
      }}>
        COMING SOON
      </div>
    </div>
  )
}

export default function App() {
  const [config, setConfig] = useState(getInitialConfig)
  const [pixels, setPixels] = useState([])
  const [imageConfig] = useState(DEFAULT_IMAGE_CONFIG)
  const [activeFeature, setActiveFeature] = useState('pixel-pattern')
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  const handleConfigChange = useCallback((updates) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const handleRandomize = useCallback(() => {
    setConfig(prev => ({ ...prev, seed: randomSeed() }))
  }, [])

  const handleReset = useCallback(() => {
    setConfig({ ...DEFAULTS, seed: randomSeed(), aspectLock: false })
  }, [])

  const handlePixelsGenerated = useCallback((newPixels) => {
    setPixels(newPixels)
  }, [])

  const handleFreePathChange = useCallback((path) => {
    setConfig(prev => ({ ...prev, freePath: path }))
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--color-canvas)',
    }}>
      {/* Utility bar */}
      <div style={{
        height: '48px',
        minHeight: '48px',
        background: 'var(--color-surface-1)',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-md)',
        gap: 'var(--space-xs)',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '0.32px' }}>
          Tribe
        </span>
        <span style={{ fontSize: '14px', color: 'var(--color-surface-3)' }}>—</span>
        <span style={{ fontSize: '14px', color: 'var(--color-ink-muted)', letterSpacing: '0.16px' }}>
          Pixel Pattern Generator
        </span>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: Feature navigation */}
        <FeatureSidebar
          activeFeature={activeFeature}
          onFeatureChange={setActiveFeature}
        />

        {/* CENTER: Active feature view */}
        {activeFeature === 'pixel-pattern' ? (
          <CanvasPreview
            config={config}
            imageConfig={imageConfig}
            onPixelsGenerated={handlePixelsGenerated}
            canvasRef={canvasRef}
            onFreePathChange={handleFreePathChange}
          />
        ) : (
          <ComingSoon />
        )}

        {/* RIGHT: Controls (only for pixel-pattern) */}
        {activeFeature === 'pixel-pattern' && (
          <ControlPanel
            config={config}
            onConfigChange={handleConfigChange}
            pixels={pixels}
            imageConfig={imageConfig}
            imgRef={imgRef}
            onRandomize={handleRandomize}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}
