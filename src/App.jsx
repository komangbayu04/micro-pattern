import React, { useRef, useState, useCallback } from 'react'
import ControlPanel, { DEFAULTS } from './components/ControlPanel.jsx'
import CanvasPreview from './components/CanvasPreview.jsx'
import ImagePanel from './components/ImagePanel.jsx'
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

export default function App() {
  const [config, setConfig] = useState(getInitialConfig)
  const [pixels, setPixels] = useState([])
  const [imageConfig, setImageConfig] = useState(DEFAULT_IMAGE_CONFIG)
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

  const handleImageChange = useCallback((newImageConfig) => {
    setImageConfig(newImageConfig)
    // Keep imgRef in sync for export
    if (newImageConfig.src) {
      const img = new Image()
      img.onload = () => { imgRef.current = img }
      img.src = newImageConfig.src
    } else {
      imgRef.current = null
    }
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
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-ink)',
          letterSpacing: '0.32px',
        }}>
          Tribe
        </span>
        <span style={{
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--color-ink-subtle)',
          letterSpacing: '0.32px',
        }}>
          —
        </span>
        <span style={{
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--color-ink-muted)',
          letterSpacing: '0.32px',
        }}>
          Pixel Pattern Generator
        </span>
      </div>

      {/* Three-panel layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: Image panel */}
        <ImagePanel
          imageConfig={imageConfig}
          onImageChange={handleImageChange}
        />

        {/* CENTER: Canvas preview */}
        <CanvasPreview
          config={config}
          imageConfig={imageConfig}
          onPixelsGenerated={handlePixelsGenerated}
          canvasRef={canvasRef}
          onFreePathChange={handleFreePathChange}
        />

        {/* RIGHT: Pattern controls */}
        <ControlPanel
          config={config}
          onConfigChange={handleConfigChange}
          pixels={pixels}
          imageConfig={imageConfig}
          imgRef={imgRef}
          onRandomize={handleRandomize}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}
