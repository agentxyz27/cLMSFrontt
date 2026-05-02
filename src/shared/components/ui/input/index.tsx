// src/shared/components/ui/input/index.tsx
import * as React from "react"
import { useTheme } from "@/providers/themeProvider"
import { ProInput } from "./pro"
import { PixelInput } from "./pixel"

type Props = React.ComponentProps<typeof ProInput>

export function Input(props: Props) {
  const { theme } = useTheme()

  return theme === "pixel" ? <PixelInput {...props} /> : <ProInput {...props} />
}