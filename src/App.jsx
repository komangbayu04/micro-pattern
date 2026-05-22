import React, { useRef, useState, useCallback } from 'react'
import ControlPanel, { DEFAULTS } from './components/ControlPanel.jsx'
import CanvasPreview from './components/CanvasPreview.jsx'
import FeatureSidebar from './components/FeatureSidebar.jsx'
import ImageryView from './components/ImageryView.jsx'
import ImageryControls from './components/ImageryControls.jsx'
import AiTribeControls from './components/AiTribeControls.jsx'
import { randomSeed } from './lib/prng.js'
import { MOSAIC_DEFAULTS } from './lib/mosaic.js'

const DEFAULT_IMAGE_CONFIG = { src: null, name: null, opacity: 1.0, fit: 'Cover', blend: 'Normal' }

function getInitialConfig() {
  return { ...DEFAULTS, seed: randomSeed(), aspectLock: false }
}

const FEATURE_LABELS = {
  'pixel-pattern': 'Pixel Pattern Generator',
  'imagery': 'Imagery',
}

export default function App() {
  const [activeFeature, setActiveFeature] = useState('pixel-pattern')

  // Pixel Pattern state
  const [config, setConfig] = useState(getInitialConfig)
  const [pixels, setPixels] = useState([])
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  // Imagery state
  const [imageryImage, setImageryImage] = useState(null)
  const [imageryConfig, setImageryConfig] = useState(MOSAIC_DEFAULTS)
  const imageryCanvasRef = useRef(null)

  // Imagery tool mode: 'mosaic' | 'ai-tribe'
  const [imageryTool, setImageryTool] = useState('mosaic')
  const [aiResult, setAiResult] = useState(null)

  // Pixel Pattern handlers
  const handleConfigChange = useCallback(u => setConfig(p => ({ ...p, ...u })), [])
  const handleRandomize = useCallback(() => setConfig(p => ({ ...p, seed: randomSeed() })), [])
  const handleReset = useCallback(() => setConfig({ ...DEFAULTS, seed: randomSeed(), aspectLock: false }), [])
  const handlePixelsGenerated = useCallback(p => setPixels(p), [])
  const handleFreePathChange = useCallback(path => setConfig(p => ({ ...p, freePath: path })), [])

  // Imagery handlers
  const handleImageryImageLoad = useCallback(img => {
    setImageryImage(img)
    setAiResult(null)
  }, [])
  const handleImageryConfigChange = useCallback(c => setImageryConfig(c), [])
  const handleAiResult = useCallback(img => setAiResult(img), [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw',
      overflow: 'hidden', background: 'var(--color-canvas)',
    }}>
      {/* Utility bar */}
      <div style={{
        height: '48px', minHeight: '48px',
        background: 'var(--color-surface-1)',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex', alignItems: 'center',
        padding: '0 var(--space-md)', gap: 'var(--space-xs)',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '0.32px' }}>Tribe</span>
        <span style={{ fontSize: '14px', color: 'var(--color-surface-3)' }}>—</span>
        <span style={{ fontSize: '14px', color: 'var(--color-ink-muted)', letterSpacing: '0.16px' }}>
          {FEATURE_LABELS[activeFeature] ?? activeFeature}
        </span>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: Feature navigation */}
        <FeatureSidebar activeFeature={activeFeature} onFeatureChange={setActiveFeature} />

        {/* CENTER + RIGHT: Dynamic per feature */}
        {activeFeature === 'pixel-pattern' && (
          <>
            <CanvasPreview
              config={config}
              imageConfig={DEFAULT_IMAGE_CONFIG}
              onPixelsGenerated={handlePixelsGenerated}
              canvasRef={canvasRef}
              onFreePathChange={handleFreePathChange}
            />
            <ControlPanel
              config={config}
              onConfigChange={handleConfigChange}
              pixels={pixels}
              imageConfig={DEFAULT_IMAGE_CONFIG}
              imgRef={imgRef}
              onRandomize={handleRandomize}
              onReset={handleReset}
            />
          </>
        )}

        {activeFeature === 'imagery' && (
          <>
            <ImageryView
              image={imageryImage}
              config={imageryConfig}
              canvasRef={imageryCanvasRef}
              onImageLoad={handleImageryImageLoad}
              activeTool={imageryTool}
              onToolChange={setImageryTool}
              aiResult={aiResult}
            />
            {imageryTool === 'mosaic' && (
              <ImageryControls
                config={imageryConfig}
                onConfigChange={handleImageryConfigChange}
                canvasRef={imageryCanvasRef}
                hasImage={!!imageryImage}
              />
            )}
            {imageryTool === 'ai-tribe' && (
              <AiTribeControls
                personImage={imageryImage}
                onResultReady={handleAiResult}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
