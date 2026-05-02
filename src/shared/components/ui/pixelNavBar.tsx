import React from "react"

interface PixelNavbarProps {
  children: React.ReactNode
}

export function PixelNavbar({ children }: PixelNavbarProps) {
  return (
    <nav className="fixed top-[15px] left-[20px] right-[20px] min-h-[30px] flex items-center justify-between px-[10px] bg-black text-white z-[1000] pixel-shadow">
      {children}
    </nav>
  )
}