'use client'

import { ThemeProvider } from 'next-themes'

// The design is paper-only; there is no dark variant, so pin the theme.
export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
