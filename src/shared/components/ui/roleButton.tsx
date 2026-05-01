import { Button } from 'pixel-retroui'

export function RoleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
    
  return (
    <Button
      onClick={onClick}
      bg={active ? '#99c1f1' : undefined}
      textColor={active ? '#000000' : undefined}
      borderColor={active ? '#000000' : undefined}
      shadow={active ? '#f9f06b' : undefined}
    >
      {children}
    </Button>
  )
}