import React from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </main>
    </div>
  )
}
