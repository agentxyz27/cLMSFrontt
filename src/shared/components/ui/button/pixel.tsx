import * as React from "react"
import { Button as RetroButton } from "pixel-retroui"

type Props = React.ComponentProps<typeof RetroButton>

export function PixelButton(props: Props) {
  return <RetroButton {...props} />
}