// shared/components/editor/hooks/useImage.ts
import { useEffect, useState } from 'react'

export function useImage(url: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!url) { setImage(null); return }

    let mounted = true
    const img = new window.Image()
    img.src = url
    img.onload = () => { if (mounted) setImage(img) }
    img.onerror = () => { if (mounted) setImage(null) }

    return () => { mounted = false }
  }, [url])

  return image
}