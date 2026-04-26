import { useEffect, useState } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Ellipse } from 'react-konva'
import type {
  CanvasData,
  CanvasElement,
  TextElementProps,
  ImageElementProps,
  ShapeElementProps
} from '../../types'

interface CanvasPreviewProps {
  contentJson?: CanvasData | null
  previewWidth?: number
}

/**
 * Image hook (safe version)
 */
function useImage(url: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!url) return

    const img = new window.Image()
    img.src = url

    let isMounted = true

    img.onload = () => {
      if (isMounted) setImage(img)
    }

    img.onerror = () => {
      if (isMounted) setImage(null)
    }

    return () => {
      isMounted = false
    }
  }, [url])

  return image
}

/**
 * Background Image
 */
function BgImage({
  url,
  width,
  height
}: {
  url: string
  width: number
  height: number
}) {
  const image = useImage(url)
  if (!image) return null

  return (
    <KonvaImage
      x={0}
      y={0}
      width={width}
      height={height}
      image={image}
      listening={false}
    />
  )
}

/**
 * Element Image Renderer
 */
function PreviewImage({ element }: { element: CanvasElement }) {
  const props = element.props as ImageElementProps
  const image = useImage(props.url)

  if (!image) return null

  return (
    <KonvaImage
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      image={image}
      listening={false}
    />
  )
}

export default function CanvasPreview({
  contentJson,
  previewWidth = 640
}: CanvasPreviewProps) {
  // 🛑 Guard: no data
  if (!contentJson || !contentJson.canvas) {
    return (
      <div
        style={{
          width: previewWidth,
          height: previewWidth * 0.5625,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <p style={{ color: '#999' }}>No preview</p>
      </div>
    )
  }

  const canvas = contentJson.canvas
  const elements = contentJson.elements ?? []

  // 🛑 Guard: invalid dimensions
  if (!canvas.width || !canvas.height) {
    return (
      <div
        style={{
          width: previewWidth,
          height: previewWidth * 0.5625,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <p style={{ color: '#999' }}>Invalid canvas</p>
      </div>
    )
  }

  const scale = previewWidth / canvas.width
  const previewHeight = canvas.height * scale

  return (
    <div style={{ width: previewWidth, height: previewHeight, overflow: 'hidden' }}>
      <Stage
        width={previewWidth}
        height={previewHeight}
        scaleX={scale}
        scaleY={scale}
        listening={false}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
            fill={canvas.background || '#ffffff'}
            listening={false}
          />

          {/* Background Image */}
          {canvas.backgroundImage && (
            <BgImage
              url={canvas.backgroundImage}
              width={canvas.width}
              height={canvas.height}
            />
          )}

          {/* Elements */}
          {elements.map(el => {
            if (!el) return null

            if (el.type === 'text') {
              const props = el.props as TextElementProps
              return (
                <Text
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  text={props.text || ''}
                  fontSize={props.fontSize || 16}
                  fill={props.color || '#000'}
                  fontStyle={props.fontStyle || 'normal'}
                  align={props.align || 'left'}
                  listening={false}
                />
              )
            }

            if (el.type === 'image') {
              return <PreviewImage key={el.id} element={el} />
            }

            if (el.type === 'shape') {
              const props = el.props as ShapeElementProps

              if (props.shape === 'ellipse') {
                return (
                  <Ellipse
                    key={el.id}
                    x={el.x + el.width / 2}
                    y={el.y + el.height / 2}
                    radiusX={el.width / 2}
                    radiusY={el.height / 2}
                    fill={props.fill || '#ccc'}
                    stroke={props.stroke || '#000'}
                    strokeWidth={props.strokeWidth || 1}
                    listening={false}
                  />
                )
              }

              return (
                <Rect
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  fill={props.fill || '#ccc'}
                  stroke={props.stroke || '#000'}
                  strokeWidth={props.strokeWidth || 1}
                  listening={false}
                />
              )
            }

            return null
          })}
        </Layer>
      </Stage>
    </div>
  )
}