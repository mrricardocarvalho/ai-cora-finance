import React from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-mesh-gradient">
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">{children}</div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </main>
    </div>
  )
}
