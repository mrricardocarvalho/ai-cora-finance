import React from 'react'
import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/components/ui/toast-provider'
import { Toaster } from '@/components/ui/toaster'
import NetworkStatus from '../components/shared/network-status'
import InstallPrompt from '../components/shared/install-prompt'
import ServiceWorkerRegister from '../components/shared/sw-register'
import { I18nProvider } from '../lib/i18n'

export const metadata: Metadata = {
  title: 'Cora Finance',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Cora Finance',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icons/icon-192x192.svg',
    apple: '/icons/apple-touch-icon-180x180.svg',
  },
  other: {
    'msapplication-TileColor': '#0891B2',
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#0891B2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <ServiceWorkerRegister />
              <NetworkStatus />
              <div className="root">{children}</div>
              <div className="fixed bottom-4 right-4 z-50">
                <InstallPrompt />
              </div>
              <Toaster />
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
