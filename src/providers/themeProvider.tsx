import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

export type ThemeMode = "pro" | "pixel"

export type ThemeContextType = {
  theme: ThemeMode
  toggleTheme: () => void
  setThemeMode: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme")
    return (saved as ThemeMode) || "pro"
  })

  // Sync theme to DOM + storage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "pro" ? "pixel" : "pro"))
  }

  const setThemeMode = (newTheme: ThemeMode) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)

  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider")
  }

  return ctx
}