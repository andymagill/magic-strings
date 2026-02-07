import React from "react"
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'

import './globals.css'

const _playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})
const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Magic Strings - Regex Creator',
  description: 'Conjure powerful regular expressions with an enchanting visual builder',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen overflow-x-hidden">{children}</body>
    </html>
  )
}
