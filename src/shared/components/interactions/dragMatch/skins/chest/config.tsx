import React from 'react'
import type { SkinConfigProps } from '../types'
import { CHEST_VARIANTS, CHEST_ASSETS, type ChestVariant } from './assets'

export const ChestConfig: React.FC<SkinConfigProps> = ({ pairs, skinMeta, onChange }) => {
  function setVariant(i: number, variant: ChestVariant) {
    onChange({ ...skinMeta, [`target_${i}_variant`]: variant })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 10, color: '#4b5568', marginBottom: 4 }}>
        Chest variant per target
      </div>
      {pairs.map((pair, i) => {
        const selected = (skinMeta[`target_${i}_variant`] as ChestVariant) ?? 'bc1'
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6 }}>
              Target {i + 1}{pair.targetLabel ? ` — ${pair.targetLabel}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CHEST_VARIANTS.map(variant => (
                <button
                  key={variant}
                  onClick={() => setVariant(i, variant)}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4,
                    padding: '8px 10px', borderRadius: 8,
                    cursor: 'pointer', border: '1px solid',
                    borderColor: selected === variant ? '#3b82f6' : '#2a2d3a',
                    background: selected === variant ? 'rgba(59,130,246,0.12)' : '#0a0c12',
                    transition: 'all 0.12s',
                  }}
                >
                  <img
                    src={CHEST_ASSETS[variant].closed}
                    alt={variant}
                    style={{ width: 48, height: 48, objectFit: 'contain', imageRendering: 'pixelated' }}
                  />
                  <span style={{ fontSize: 9, color: selected === variant ? '#60a5fa' : '#4b5568' }}>
                    {variant}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}