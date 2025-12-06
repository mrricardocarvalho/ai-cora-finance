"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Plus, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteConversation } from '../../lib/actions/chat'
import type { Conversation } from '../../lib/actions/chat'

interface ConversationListProps {
  conversations: Conversation[]
  currentId?: string
  onClose?: () => void
}

export default function ConversationList({ conversations, currentId, onClose }: ConversationListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (deletingId) return
    setDeletingId(id)
    
    const result = await deleteConversation(id)
    if (result.success) {
      if (currentId === id) {
        router.push('/chat')
      }
      router.refresh()
    }
    setDeletingId(null)
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
  }
  
  return (
    <div className="h-full flex flex-col bg-[var(--bg-subtle)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-surface flex items-center justify-between">
        <h2 className="font-semibold text-[var(--text-primary)]">Conversas</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--primary)]"
            title="Nova conversa"
          >
            <Plus className="w-5 h-5" />
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] md:hidden text-[var(--text-secondary)]"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-muted)] text-sm">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma conversa ainda.</p>
            <p className="mt-1">Começa a falar com a Cora!</p>
          </div>
        ) : (
          <AnimatePresence>
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Link
                  href={`/chat?id=${conv.id}`}
                  className={`block p-3 border-b border-[var(--border)] hover:bg-surface transition-colors group ${
                    currentId === conv.id ? 'bg-surface border-l-2 border-l-[var(--primary)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {formatDate(conv.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      disabled={deletingId === conv.id}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-all"
                      title="Apagar conversa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
