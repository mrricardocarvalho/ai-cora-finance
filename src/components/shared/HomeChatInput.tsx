"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { useTranslations } from '../../lib/i18n'

/**
 * HomeChatInput - Sticky chat input for the home page
 * Navigates to /chat with the user's question pre-filled
 */
export default function HomeChatInput() {
  const [input, setInput] = useState('')
  const router = useRouter()
  const t = useTranslations()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      router.push('/chat')
      return
    }
    // Navigate to chat with the question as a query param
    router.push(`/chat?q=${encodeURIComponent(input.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.chat.placeholder}
        className="flex-1 px-4 py-3 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] shadow-lg"
      />
      <button
        type="submit"
        title={t.chat.send}
        aria-label={t.chat.send}
        className="px-4 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/25"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  )
}
