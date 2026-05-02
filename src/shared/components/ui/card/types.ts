export type CardVariant = "default" | "outline" | "ghost"

export type CardProps = {
  variant?: CardVariant
  className?: string
  children: React.ReactNode
}