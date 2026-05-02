import * as React from "react"
import { useTheme } from "@/providers/themeProvider"
import { ProCard } from "./pro"
import { PixelCard } from "./pixel"

type Props = {
  children?: React.ReactNode
  className?: string
} & Partial<React.ComponentProps<typeof PixelCard>>

export function Card(props: Props) {
  const { theme } = useTheme()

  return theme === "pixel" ? <PixelCard {...props} /> : <ProCard {...props} />
}