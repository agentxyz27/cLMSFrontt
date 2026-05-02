import * as React from "react"
import { Button as ShadButton } from "@/shared/components/primitives/button"

type Props = React.ComponentProps<typeof ShadButton>

export function ProButton(props: Props) {
  return <ShadButton {...props} />
}