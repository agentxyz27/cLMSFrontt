// shared/components/editor/elements/konva/BackgroundImage.tsx
import { Image as KonvaImage } from 'react-konva'
import { useImage } from '../../hooks/useImage'

export function BackgroundImage({ url, width, height }: { url: string; width: number; height: number }) {
  const image = useImage(url)
  if (!image) return null
  return <KonvaImage x={0} y={0} width={width} height={height} image={image} listening={false} />
}