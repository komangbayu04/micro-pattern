import React from 'react'

const FEATURES = [
  {
    id: 'pixel-pattern',
    label: 'Pixel Pattern',
    description: 'Generate scatter patterns',
    icon: PixelIcon,
  },
  {
    id: 'imagery',
    label: 'Imagery',
    description: 'AI image generation',
    icon: ImageryIcon,
    comingSoon: true,
  },
]

export default function FeatureSidebar({ activeFeature, onFeatureChange }) {
  return (
    <div style={{
      width: '200px',
      minWidth: '200px',
      background: 'var(--color-surface-1)',
      borderRight: '1px solid var(--color-hairline)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Section label */}
      <div style={{
        padding: '20px 16px 10px',
      }}>
        <span className="eyebrow">Features</span>
      </div>

      {/* Feature list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
        {FEATURES.map(f => {
          const active = f.id === activeFeature && !f.comingSoon
          const Icon = f.icon
          return (
            <button
              key={f.id}
              onClick={() => !f.comingSoon && onFeatureChange(f.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                background: active ? 'var(--color-surface-2)' : 'transparent',
                border: 'none',
                borderLeft: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                borderRadius: '0px',
                cursor: f.comingSoon ? 'default' : 'pointer',
                textAlign: 'left',
                width: '100%',
                opacity: f.comingSoon ? 0.45 : 1,
                transition: 'background 80ms, border-color 80ms',
              }}
              onMouseEnter={e => {
                if (!active && !f.comingSoon) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                if (!active && !f.comingSoon) e.currentTarget.style.background = 'transparent'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: active ? 'rgba(69,137,255,0.15)' : 'var(--color-surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: active ? 'var(--color-primary)' : 'var(--color-ink-subtle)',
              }}>
                <Icon />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    whiteSpace: 'nowrap',
                  }}>
                    {f.label}
                  </span>
                  {f.comingSoon && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      color: 'var(--color-ink-subtle)',
                      background: 'var(--color-surface-2)',
                      padding: '1px 5px',
                      textTransform: 'uppercase',
                    }}>
                      Soon
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--color-ink-subtle)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {f.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Spacer + version info at bottom */}
      <div style={{ flex: 1 }} />
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--color-hairline)',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--color-ink-subtle)' }}>
          Tribe v1.0
        </span>
      </div>
    </div>
  )
}

function PixelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="4" height="4"/>
      <rect x="6" y="1" width="4" height="4"/>
      <rect x="11" y="1" width="4" height="4"/>
      <rect x="1" y="6" width="4" height="4"/>
      <rect x="6" y="6" width="4" height="4"/>
      <rect x="11" y="6" width="4" height="4"/>
      <rect x="1" y="11" width="4" height="4"/>
      <rect x="6" y="11" width="4" height="4"/>
      <rect x="11" y="11" width="4" height="4"/>
    </svg>
  )
}

function ImageryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="14" height="14" rx="0"/>
      <circle cx="5.5" cy="5.5" r="1.5"/>
      <path d="M1 10l4-4 3 3 2-2 5 5"/>
    </svg>
  )
}
