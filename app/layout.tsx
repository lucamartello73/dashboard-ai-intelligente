import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import AuthWrapper from '@/components/AuthWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dashboard AI Intelligente',
  description: 'Il tuo maestro d\'orchestra per l\'automazione',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
        <Analytics />
      </body>
    </html>
  )
}
