import React from 'react'
import type { SkinConfigProps } from '../types'

const ANIMALS = [
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog' },
  { id: 'rabbit', emoji: '🐰', name: 'Rabbit' },
  { id: 'bird', emoji: '🐦', name: 'Bird' },
  { id: 'frog', emoji: '🐸', name: 'Frog' },
]
const FOODS = [
  { id: 'fish', emoji: '🐟', name: 'Fish' },
  { id: 'bone', emoji: '🦴', name: 'Bone' },
  { id: 'carrot', emoji: '🥕', name: 'Carrot' },
  { id: 'worm', emoji: '🪱', name: 'Worm' },
  { id: 'fly', emoji: '🪰', name: 'Fly' },
  { id: 'generic', emoji: '⭐', name: 'Generic' },
]

const inputCss: React.CSSProperties = {
  width: '100%', fontSize: 12, padding: '6px 10px',
  borderRadius: 6, border: '1px solid #2a2d3a',
  background: '#0a0c12', color: '#e2e8f0',
  boxSizing: 'border-box', outline: 'none',
}

const tileCss = (selected: boolean): React.CSSProperties => ({
  padding: '8px 6px', borderRadius: 8, textAlign: 'center',
  cursor: 'pointer', border: '1px solid',
  borderColor: selected ? '#3b82f6' : '#2a2d3a',
  background: selected ? 'rgba(59,130,246,0.12)' : '#0a0c12',
  transition: 'all 0.12s',
})

export const AnimalFeedingConfig: React.FC<SkinConfigProps> = ({ pairs, skinMeta, onChange }) => {
  function setTargetAnimal(i: number, animalType: string) {
    onChange({ ...skinMeta, [`target_${i}_animal`]: animalType })
  }
  function setItemFood(i: number, foodType: string) {
    onChange({ ...skinMeta, [`item_${i}_food`]: foodType })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* per-target animal */}
      <div>
        <div style={{ fontSize: 10, color: '#4b5568', marginBottom: 8 }}>Animal per target</div>
        {pairs.map((pair, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6 }}>
              Target {i + 1}{pair.targetLabel ? ` — ${pair.targetLabel}` : ''}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {ANIMALS.map(a => (
                <button
                  key={a.id}
                  style={tileCss(skinMeta[`target_${i}_animal`] === a.id)}
                  onClick={() => setTargetAnimal(i, a.id)}
                >
                  <div style={{ fontSize: 22 }}>{a.emoji}</div>
                  <div style={{ fontSize: 9, color: skinMeta[`target_${i}_animal`] === a.id ? '#60a5fa' : '#4b5568', marginTop: 2 }}>
                    {a.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* per-item food */}
      <div>
        <div style={{ fontSize: 10, color: '#4b5568', marginBottom: 8 }}>Food type per item</div>
        {pairs.map((pair, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pair.itemLabel || `Item ${i + 1}`}
            </span>
            <select
              value={(skinMeta[`item_${i}_food`] as string) ?? 'generic'}
              onChange={e => setItemFood(i, e.target.value)}
              style={inputCss}
            >
              {FOODS.map(f => (
                <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

    </div>
  )
}