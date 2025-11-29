import React from 'react'
import '../styles/globals.css'

export const metadata = { title: 'Cora Finance' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="root">{children}</div>
      </body>
    </html>
  )
}
