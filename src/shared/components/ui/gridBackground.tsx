import React from "react"

type GridBackgroundProps = {
  size?: number
  color?: string
  className?: string
  children?: React.ReactNode
}

export default function GridBackground({
  size = 30,
  color = "rgba(0,0,0,0.1)",
  className = "",
  children,
}: GridBackgroundProps) {
  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(to right, ${color} 1px, transparent 1px),
          linear-gradient(to bottom, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    >
      {children}
    </div>
  )
}