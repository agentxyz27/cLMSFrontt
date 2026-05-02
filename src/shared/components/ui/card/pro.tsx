import * as React from "react"
import { cn } from "@/lib/utils"
import { Card as BaseCard } from "@/shared/components/primitives/card"

type Props = React.ComponentProps<typeof BaseCard>

export function ProCard({ className, ...props }: Props) {
  return (
    <BaseCard
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}