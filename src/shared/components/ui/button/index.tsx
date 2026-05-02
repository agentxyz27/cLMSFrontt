import * as React from "react"
import { useTheme } from "@/providers/themeProvider"
import { ProButton } from "./pro"
import { PixelButton } from "./pixel"

type Props = React.ComponentProps<typeof ProButton> &
  React.ComponentProps<typeof PixelButton>

export function Button(props: Props) {
  const { theme } = useTheme()

  return theme === "pixel" ? <PixelButton {...props} /> : <ProButton {...props} />
}