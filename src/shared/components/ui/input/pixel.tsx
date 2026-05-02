// src/shared/components/ui/input/pixel.tsx
import * as React from "react"
import { Input as RetroInput } from "pixel-retroui"

type Props = React.ComponentProps<typeof RetroInput>

export function PixelInput(props: Props) {
  return <RetroInput {...props} />
}