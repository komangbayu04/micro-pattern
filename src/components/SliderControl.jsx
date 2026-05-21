import React from 'react'

export default function SliderControl({
  label,
  sublabel,
  min,
  max,
  step,
  value,
  onChange,
  showNumber = true,
  unit = '',
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: '14px', fontWeight: 400, color: 'var(--color-ink)' }}>
          {label}
        </label>
        {showNumber && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={e => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
              }}
              style={{
                width: '64px',
                textAlign: 'right',
                fontSize: '12px',
                padding: '3px 6px',
              }}
            />
            {unit && (
              <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>{unit}</span>
            )}
          </div>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((value - min) / (max - min)) * 100}%, var(--color-surface-2) ${((value - min) / (max - min)) * 100}%, var(--color-surface-2) 100%)`,
        }}
      />
      {sublabel && (
        <span className="caption">{sublabel}</span>
      )}
    </div>
  )
}
