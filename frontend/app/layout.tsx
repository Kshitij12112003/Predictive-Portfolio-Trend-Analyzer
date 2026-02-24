import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StockShelf Pro | Predictive Portfolio Analytics',
  description: 'AI-powered stock portfolio tracking and forecasting dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* Ambient background glow effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-900/20 blur-[150px]" />
        </div>
        {children}
      </body>
    </html>
  )
}
