import React, { useRef, useState, useCallback, useEffect } from 'react'
import ControlPanel, { DEFAULTS } from './components/ControlPanel.jsx'
import CanvasPreview from './components/CanvasPreview.jsx'
import { randomSeed } from './lib/prng.js'

function getInitialConfig() {
  return {
    ...DEFAULTS,
    seed: randomSeed(),
    aspectLock: false,
  }
}

export default function App() {
  const [config, setConfig] = useState(getInitialConfig)
  const [pixels, setPixels] = useState([])
  const canvasRef = useRef(null)

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
    }}>
      {/* Utility bar */}
      <div style={{
        height: '32px',
        minHeight: '32px',
        background: 'var(--color-surface-1)',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-md)',
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 400,
          color: 'var(--color-ink-muted)',
          letterSpacing: 'var(--letter-spacing-caption)',
        }}>
          Pixel Pattern Generator — IBM Carbon Edition
        </span>
      </div>

      {/* Main layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        <ControlPanel
          config={config}
          onConfigChange={handleConfigChange}
          canvasRef={canvasRef}
          pixels={pixels}
          onRandomize={handleRandomize}
          onReset={handleReset}
        />
        <CanvasPreview
          config={config}
          onPixelsGenerated={handlePixelsGenerated}
          canvasRef={canvasRef}
          onFreePathChange={handleFreePathChange}
        />
      </div>
    </div>
  )
}
