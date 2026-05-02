export default function AppBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none bg-repeat"
      style={{
        backgroundImage: "var(--bg-image)",
        backgroundSize: "var(--bg-size)",
        imageRendering: "pixelated",
      }}
    />
  )
}