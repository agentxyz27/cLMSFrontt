// shared/components/editor/hooks/useTransformer.ts
import { useRef, useEffect } from 'react'
import type Konva from 'konva'

interface UseTransformerProps {
  selectedId: string | null
}

export function useTransformer({ selectedId }: UseTransformerProps) {
  const trRef    = useRef<Konva.Transformer>(null)
  const nodeRefs = useRef<Map<string, Konva.Node>>(new Map())

  useEffect(() => {
    if (!trRef.current) return
    if (selectedId) {
      const node = nodeRefs.current.get(selectedId)
      trRef.current.nodes(node ? [node] : [])
    } else {
      trRef.current.nodes([])
    }
    trRef.current.getLayer()?.batchDraw()
  }, [selectedId])

  const nodeRefCallback = (id: string) => (node: Konva.Node | null) => {
    if (node) nodeRefs.current.set(id, node)
    else nodeRefs.current.delete(id)
  }

  return { trRef, nodeRefCallback }
}