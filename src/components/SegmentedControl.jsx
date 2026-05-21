import React from 'react'

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0px',
        border: '1px solid var(--color-hairline)',
        background: 'var(--color-canvas)',
      }}
    >
      {options.map(opt => {
        const active = opt === value
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex: '1 1 auto',
              minWidth: '64px',
              padding: '7px 10px',
              fontSize: '12px',
              fontWeight: active ? 600 : 400,
              background: active ? 'var(--color-primary)' : 'transparent',
              color: active ? 'var(--color-on-primary)' : 'var(--color-ink)',
              border: 'none',
              borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
              borderRadius: '0px',
              cursor: 'pointer',
              letterSpacing: 'var(--letter-spacing-body)',
              transition: 'background 80ms, color 80ms',
              whiteSpace: 'nowrap',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
