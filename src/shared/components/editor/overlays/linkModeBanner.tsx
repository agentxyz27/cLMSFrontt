interface LinkModeBannerProps {
  targetLabel: string
  onCancel: () => void
}

export function LinkModeBanner({ targetLabel, onCancel }: LinkModeBannerProps) {
  return (
    <div style={{
      position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
      zIndex: 999, pointerEvents: 'all',
      background: '#f59e0b', borderRadius: 8,
      padding: '8px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#0a0c12' }}>
        🔗 Click a DRAG item to link → "{targetLabel || 'target'}"
      </span>
      <button
        onClick={onCancel}
        style={{
          background: 'rgba(0,0,0,0.18)', border: 'none', borderRadius: 4,
          cursor: 'pointer', color: '#0a0c12', fontSize: 11,
          fontWeight: 600, padding: '2px 8px',
        }}
      >
        Cancel (Esc)
      </button>
    </div>
  )
}