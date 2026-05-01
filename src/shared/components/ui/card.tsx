import { Card } from "pixel-retroui"

interface MainCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export function MainCard({ children, className, onClick }: MainCardProps) {
  const CardWrapper = onClick ? 'button' : 'div';
  
  return (
    <CardWrapper onClick={onClick} className={className}>
      <Card
        bg="#fefcd0"
        textColor="black"
        borderColor="black"
        shadowColor="#c381b5"
        className={`p-6 flex flex-col gap-4 ${className}`}>
        {children}
      </Card>
    </CardWrapper>
  )
}