import React from 'react'

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg">
        <span className="text-white text-lg font-bold">C</span>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
        Cora
      </span>
    </div>
  )
}
