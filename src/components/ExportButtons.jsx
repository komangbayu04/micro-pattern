import React from 'react'
import { exportPNG, exportSVG } from '../lib/export.js'

export default function ExportButtons({ pixels, config }) {
  const handlePNG = () => {
    if (!pixels || pixels.length === 0) return
    exportPNG(pixels, config)
  }

  const handleSVG = () => {
    if (!pixels || pixels.length === 0) return
    exportSVG(pixels, config)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button className="btn-primary" onClick={handlePNG}>
        <DownloadIcon />
        Download PNG
      </button>
      <button className="btn-tertiary" onClick={handleSVG}>
        <DownloadIcon />
        Download SVG
      </button>
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
