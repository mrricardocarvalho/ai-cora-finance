"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, AlertTriangle, TrendingUp, Lightbulb, PartyPopper, Mic } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from './ChatMessage'
import VoiceInput from './VoiceInput'
import { VoiceToggle } from './VoiceResponse'
import JarvisModeOverlay from './JarvisModeOverlay'
import CoraAvatar from '../shared/cora-avatar'
import { sendMessage, getOrCreatePrimaryConversation } from '../../lib/actions/chat'
import type { Message, Conversation, CoraGreeting } from '../../lib/actions/chat'
import type { ProactiveInsight } from '../../lib/intelligence/proactive-analysis'
import { useTranslations, useI18n } from '../../lib/i18n'

interface ChatInterfaceProps {
  userId: string
  initialConversation?: Conversation | null
  initialMessages?: Message[]
  proactiveGreeting?: CoraGreeting | null
}

// Icon mapping for insight types
const INSIGHT_ICONS = {
  observation: Lightbulb,
  warning: AlertTriangle,
  opportunity: TrendingUp,
  celebration: PartyPopper
}

const INSIGHT_COLORS = {
  observation: 'bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]',
  warning: 'bg-[var(--warning)]/10 border-[var(--warning)]/20 text-[var(--warning)]',
  opportunity: 'bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]',
  celebration: 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]'
}

export default function ChatInterface({ 
  userId, 
  initialConversation, 
  initialMessages = [],
  proactiveGreeting
}: ChatInterfaceProps) {
  const t = useTranslations()
  const { locale } = useI18n()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [conversation, setConversation] = useState<Conversation | null>(initialConversation || null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(true)
  const [inputBeforeListening, setInputBeforeListening] = useState('')
  const [isJarvisModeOpen, setIsJarvisModeOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keyboard shortcuts for voice (AC #3 from Story 12.5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key.toLowerCase()) {
        case 'v':
          // Toggle Jarvis mode with V key
          setIsJarvisModeOpen(prev => !prev)
          break
        case 'escape':
          // Close Jarvis mode with Escape
          setIsJarvisModeOpen(false)
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    await sendUserMessage(input.trim())
  }
  
  const sendUserMessage = async (messageText: string) => {
    setError(null)
    setIsLoading(true)
    setInput('')
    setShowInsights(false) // Hide insights once conversation starts
    
    try {
      // Get or create conversation if needed
      let convId = conversation?.id
      if (!convId) {
        const result = await getOrCreatePrimaryConversation(userId)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to create conversation')
        }
        convId = result.data.id
        setConversation(result.data)
      }
      
      // Optimistically add user message
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: convId,
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, tempUserMessage])
      
      // Send to API with locale
      const result = await sendMessage(userId, convId, messageText, locale)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to send message')
      }
      
      // Add assistant response
      setMessages(prev => [...prev, result.data!])
      
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : t.common.error)
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }
  
  const handleSuggestedQuestion = (question: string) => {
    sendUserMessage(question)
  }

  // Handler for Jarvis Mode messages
  const handleJarvisModeMessage = useCallback(async (message: string): Promise<string> => {
    // Get or create conversation if needed
    let convId = conversation?.id
    if (!convId) {
      const result = await getOrCreatePrimaryConversation(userId)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create conversation')
      }
      convId = result.data.id
      setConversation(result.data)
    }

    // Add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: convId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMessage])

    // Send to API
    const result = await sendMessage(userId, convId, message, locale)
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to send message')
    }

    // Add assistant response
    setMessages(prev => [...prev, result.data!])
    
    return result.data.content
  }, [conversation?.id, userId, locale])
  
  const hasMessages = messages.length > 0
  const hasInsights = proactiveGreeting?.insights && proactiveGreeting.insights.length > 0
  
  // Component to render a proactive insight card
  const InsightCard = ({ insight, index }: { insight: ProactiveInsight; index: number }) => {
    const Icon = INSIGHT_ICONS[insight.type]
    const colorClass = INSIGHT_COLORS[insight.type]
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.1 }}
        className={`p-3 rounded-lg border ${colorClass}`}
      >
        <div className="flex items-start gap-2">
          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <p className="text-sm mt-1 opacity-90">{insight.message}</p>
            {insight.actionable && (
              <p className="text-xs mt-2 font-medium opacity-75">💡 {insight.actionable}</p>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Proactive Insights Banner - shows when there are insights regardless of messages */}
      {showInsights && hasInsights && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--bg-subtle)] to-surface px-4 py-3"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CoraAvatar state="idle" size={24} />
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {proactiveGreeting?.greeting || t.chat.greeting}
                </span>
              </div>
              <button
                onClick={() => setShowInsights(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                {t.common.close}
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {proactiveGreeting!.insights.slice(0, 4).map((insight, i) => (
                <InsightCard key={i} insight={insight} index={i} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {!hasMessages ? (
          // Empty state / Welcome with proactive insights
          <div className="h-full flex flex-col items-center justify-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CoraAvatar state="idle" size={64} />
            </motion.div>
            
            {/* Proactive greeting from Cora */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-center max-w-lg"
            >
              {proactiveGreeting?.greeting ? (
                <p className="text-lg text-[var(--text-primary)]">{proactiveGreeting.greeting}</p>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    {t.chat.greeting}
                  </h2>
                  <p className="text-[var(--text-secondary)] mt-2">
                    {t.chat.greetingSubtitle}
                  </p>
                </>
              )}
            </motion.div>
            
            {/* Proactive insights from Cora */}
            {showInsights && hasInsights && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 w-full max-w-md space-y-3"
              >
                <p className="text-sm text-[var(--text-muted)] text-center mb-2">
                  {t.chat.hereIsWhatIFound}
                </p>
                {proactiveGreeting!.insights.slice(0, 3).map((insight, i) => (
                  <InsightCard key={i} insight={insight} index={i} />
                ))}
              </motion.div>
            )}
            
            {/* Starter questions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: hasInsights ? 0.6 : 0.2 }}
              className="mt-8 flex flex-wrap justify-center gap-2 max-w-lg"
            >
              <p className="w-full text-xs text-[var(--text-muted)] text-center mb-2">
                {hasInsights ? t.chat.orAskAnything : t.chat.askAnything}
              </p>
              {t.chat.starterQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="px-4 py-2 rounded-full border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:border-[var(--primary)]/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          // Messages list
          <div className="space-y-6 max-w-2xl mx-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onSuggestedQuestion={handleSuggestedQuestion}
                />
              ))}
            </AnimatePresence>
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <CoraAvatar state="thinking" size={32} />
                <div className="bg-[var(--bg-subtle)] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.chat.thinking}
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-[var(--danger)]/10 text-[var(--danger)] text-sm text-center">
          {error}
        </div>
      )}
      
      {/* Input area */}
      <div className="border-t border-[var(--border)] bg-surface px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Voice controls row */}
          <div className="flex items-center justify-between mb-3">
            <VoiceToggle />
            <button
              type="button"
              onClick={() => setIsJarvisModeOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors"
              aria-label={locale.startsWith('pt') ? 'Modo Jarvis' : 'Jarvis Mode'}
            >
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">
                {locale.startsWith('pt') ? 'Modo Jarvis' : 'Jarvis Mode'}
              </span>
            </button>
          </div>
          
          <div className="flex gap-3">
            <VoiceInput 
              onTranscript={(text) => {
                const prefix = inputBeforeListening ? inputBeforeListening + ' ' : ''
                setInput(prefix + text)
              }}
              onListeningChange={(isListening) => {
                if (isListening) {
                  setInputBeforeListening(input)
                }
              }}
              disabled={isLoading}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-full border border-[var(--border)] bg-surface text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              title={t.chat.send}
              aria-label={t.chat.send}
              className="px-4 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--primary)]/25"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
            {t.chat.disclaimer}
          </p>
        </form>
      </div>

      {/* Jarvis Mode Overlay */}
      <JarvisModeOverlay
        isOpen={isJarvisModeOpen}
        onClose={() => setIsJarvisModeOpen(false)}
        onMessage={handleJarvisModeMessage}
      />
    </div>
  )
}
