import React from "react"

type EnvironmentLayerProps = {
  size?: number
  color?: string
  className?: string
  children?: React.ReactNode
}

export default function EnvironmentLayer({
  size = 30,
  color = "rgba(0,0,0,0.1)",
  className = "",
  children,
}: EnvironmentLayerProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* BACKGROUND */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${color} 1px, transparent 1px),
            linear-gradient(to bottom, ${color} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
          imageRendering: "pixelated",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}