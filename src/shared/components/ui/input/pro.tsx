// src/shared/components/ui/input/pro.tsx
import * as React from "react"
import { Input as ShadInput } from "@/shared/components/primitives/input"

type Props = React.ComponentProps<typeof ShadInput>

export function ProInput(props: Props) {
  return <ShadInput {...props} />
}