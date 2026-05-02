import * as React from "react"
import { Card as RetroCard } from "pixel-retroui"

type BaseProps = React.ComponentProps<typeof RetroCard>

type Props = Omit<BaseProps, "className" | "children"> & {
  children?: React.ReactNode
  className?: string
  wrapperClassName?: string
}

export function PixelCard({
  children,
  className,
  ...props
}: Props) {
  return (
      <RetroCard className={className} {...props}>
        {children ?? null}
      </RetroCard>
  )
}