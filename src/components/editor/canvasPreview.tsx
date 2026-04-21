/**
 * canvasPreview.tsx
 *
 * Read-only scaled canvas renderer for template previews.
 * No selection, drag, or interaction — display only.
 * Scales the canvas to fit a given width while maintaining aspect ratio.
 */

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
  contentJson: CanvasData
  previewWidth?: number
}

/**
 * Slightly more responsible image hook
 * Handles loading + updates when URL changes
 */
function useImage(url: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new window.Image()
    img.src = url

    img.onload = () => setImage(img)
    img.onerror = () => setImage(null)

    return () => {
      // cleanup just in case
      setImage(null)
    }
  }, [url])

  return image
}

/**
 * Background Image Component (fixes hook rule issue)
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
  const { canvas, elements } = contentJson

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
          {/* Background Color */}
          <Rect
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
            fill={canvas.background}
            listening={false}
          />

          {/* Background Image (NEW) */}
          {canvas.backgroundImage && (
            <BgImage
              url={canvas.backgroundImage}
              width={canvas.width}
              height={canvas.height}
            />
          )}

          {/* Elements */}
          {elements.map(el => {
            if (el.type === 'text') {
              const props = el.props as TextElementProps
              return (
                <Text
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  text={props.text}
                  fontSize={props.fontSize}
                  fill={props.color}
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
                    fill={props.fill}
                    stroke={props.stroke}
                    strokeWidth={props.strokeWidth}
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
                  fill={props.fill}
                  stroke={props.stroke}
                  strokeWidth={props.strokeWidth}
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