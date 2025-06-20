"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export const ThemeProvider = React.memo(({ children, ...props }) => {
  return (
    <NextThemesProvider 
      {...props}
      enableSystem={true}
      storageKey="theme"
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
})