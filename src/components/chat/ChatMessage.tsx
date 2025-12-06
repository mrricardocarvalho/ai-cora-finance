"use client"

import React from 'react'
import { motion } from 'framer-motion'
import CoraAvatar from '../shared/cora-avatar'
import VoiceResponse from './VoiceResponse'
import type { Message } from '../../lib/actions/chat'
import { formatCurrency, formatNumber } from '../../lib/utils'
import { useTranslations } from '../../lib/i18n'

interface ChatMessageProps {
  message: Message
  onSuggestedQuestion?: (question: string) => void
}

export default function ChatMessage({ message, onSuggestedQuestion }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const t = useTranslations()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-[var(--primary-glass)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-sm font-medium">
            {t.common.you}
          </div>
        ) : (
          <CoraAvatar state="idle" size={32} />
        )}
      </div>
      
      {/* Message bubble */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block px-4 py-3 rounded-2xl shadow-[var(--shadow-glass)] ${
            isUser
              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-tr-sm'
              : 'bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] text-[var(--text-on-glass)] rounded-tl-sm'
          }`}
        >
          {/* Render rich markdown content */}
          <div className="text-sm whitespace-pre-wrap">
            <MessageContent content={message.content} isUser={isUser} />
          </div>
        </div>
        
        {/* Voice response button for assistant messages */}
        {!isUser && (
          <div className="mt-2 flex items-center gap-2">
            <VoiceResponse text={message.content} compact />
          </div>
        )}
        
        {/* Suggested questions */}
        {!isUser && message.suggested_questions && message.suggested_questions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggested_questions.map((q, i) => (
              <button
                key={i}
                onClick={() => onSuggestedQuestion?.(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary-glass)] text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all duration-300"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs text-[var(--text-muted)] mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.created_at).toLocaleTimeString('pt-PT', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </motion.div>
  )
}

// Rich markdown rendering with tables, lists, and formatting
function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  // Parse content blocks: tables, code, and regular text
  const blocks = parseContentBlocks(content)
  
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'table') {
          return <RichTable key={i} data={block.data} isUser={isUser} />
        }
        if (block.type === 'code') {
          return <CodeBlock key={i} code={block.content} language={block.language} isUser={isUser} />
        }
        if (block.type === 'stats') {
          return <StatsCard key={i} stats={block.stats} isUser={isUser} />
        }
        // Regular text
        return <TextBlock key={i} content={block.content} isUser={isUser} />
      })}
    </>
  )
}

// Parse content into structured blocks
interface ContentBlock {
  type: 'text' | 'table' | 'code' | 'stats'
  content: string
  data?: { headers: string[]; rows: string[][] }
  language?: string
  stats?: { label: string; value: string; trend?: 'up' | 'down' }[]
}

function parseContentBlocks(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  
  // Pattern for markdown tables
  const tablePattern = /\n?\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g
  
  // Pattern for code blocks
  const codePattern = /```(\w*)\n([\s\S]*?)```/g
  
  // Pattern for stats blocks (custom format: [STATS]...[/STATS])
  const statsPattern = /\[STATS\]([\s\S]*?)\[\/STATS\]/g
  
  let lastIndex = 0
  const matches: { index: number; length: number; block: ContentBlock }[] = []
  
  // Find tables
  let tableMatch
  while ((tableMatch = tablePattern.exec(content)) !== null) {
    const headerRow = tableMatch[1].split('|').map(s => s.trim()).filter(Boolean)
    const bodyRows = tableMatch[2].trim().split('\n').map(row => 
      row.split('|').map(s => s.trim()).filter(Boolean)
    )
    matches.push({
      index: tableMatch.index,
      length: tableMatch[0].length,
      block: { type: 'table', content: '', data: { headers: headerRow, rows: bodyRows } }
    })
  }
  
  // Find code blocks
  let codeMatch
  while ((codeMatch = codePattern.exec(content)) !== null) {
    matches.push({
      index: codeMatch.index,
      length: codeMatch[0].length,
      block: { type: 'code', content: codeMatch[2], language: codeMatch[1] || 'text' }
    })
  }
  
  // Find stats blocks
  let statsMatch
  while ((statsMatch = statsPattern.exec(content)) !== null) {
    const statsContent = statsMatch[1].trim()
    const stats = statsContent.split('\n').map(line => {
      const parts = line.split(':').map(s => s.trim())
      const trend = line.includes('↑') ? 'up' as const : line.includes('↓') ? 'down' as const : undefined
      return { label: parts[0], value: parts[1]?.replace(/[↑↓]/g, '').trim() || '', trend }
    }).filter(s => s.label && s.value)
    
    matches.push({
      index: statsMatch.index,
      length: statsMatch[0].length,
      block: { type: 'stats', content: '', stats }
    })
  }
  
  // Sort by index
  matches.sort((a, b) => a.index - b.index)
  
  // Build blocks with text in between
  for (const match of matches) {
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index).trim()
      if (textBefore) {
        blocks.push({ type: 'text', content: textBefore })
      }
    }
    blocks.push(match.block)
    lastIndex = match.index + match.length
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex).trim()
    if (textAfter) {
      blocks.push({ type: 'text', content: textAfter })
    }
  }
  
  // If no special blocks found, treat as single text block
  if (blocks.length === 0) {
    blocks.push({ type: 'text', content })
  }
  
  return blocks
}

// Rich table component
function RichTable({ data, isUser }: { data?: { headers: string[]; rows: string[][] }; isUser: boolean }) {
  if (!data) return null
  
  return (
    <div className={`my-2 overflow-x-auto rounded-xl border ${isUser ? 'border-white/20' : 'border-[var(--border-glass)]'}`}>
      <table className="w-full text-xs">
        <thead>
          <tr className={isUser ? 'bg-white/10' : 'bg-[var(--surface-glass)]'}>
            {data.headers.map((h, i) => (
              <th key={i} className={`px-3 py-2 text-left font-semibold ${isUser ? 'text-white/90' : 'text-[var(--text-primary)]'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className={isUser ? 'border-t border-white/10' : 'border-t border-[var(--border-glass)]'}>
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-2 ${isUser ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                  {formatCellValue(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Format cell values (detect currency, numbers, percentages)
function formatCellValue(value: string): React.ReactNode {
  // Currency pattern
  if (/^€?\s*-?\d+([.,]\d+)?€?$/.test(value.replace(/\s/g, ''))) {
    const num = parseFloat(value.replace(/[€\s]/g, '').replace(',', '.'))
    const isNegative = num < 0
    return (
      <span className={isNegative ? 'text-[var(--danger)]' : 'text-[var(--success)]'}>
        {formatCurrency(Math.abs(num))}
      </span>
    )
  }
  // Percentage pattern
  if (/^-?\d+([.,]\d+)?%$/.test(value)) {
    const num = parseFloat(value.replace(',', '.'))
    const isNegative = num < 0
    return (
      <span className={isNegative ? 'text-[var(--danger)]' : 'text-[var(--success)]'}>
        {formatNumber(num, 1)}%
      </span>
    )
  }
  return value
}

// Code block component
function CodeBlock({ code, language, isUser }: { code: string; language?: string; isUser: boolean }) {
  return (
    <div className={`my-2 rounded-xl overflow-hidden ${isUser ? 'bg-white/10' : 'bg-[var(--bg-muted)] border border-[var(--border-glass)]'}`}>
      {language && (
        <div className={`px-3 py-1 text-[10px] uppercase tracking-wide ${isUser ? 'text-white/60 bg-white/5' : 'text-[var(--text-muted)] bg-[var(--surface-glass)]'}`}>
          {language}
        </div>
      )}
      <pre className={`p-3 text-xs overflow-x-auto ${isUser ? 'text-white/90' : 'text-[var(--text-primary)]'}`}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Stats card component
function StatsCard({ stats, isUser }: { stats?: { label: string; value: string; trend?: 'up' | 'down' }[]; isUser: boolean }) {
  if (!stats || stats.length === 0) return null
  
  return (
    <div className={`my-2 grid gap-2 ${stats.length === 1 ? 'grid-cols-1' : stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {stats.map((stat, i) => (
        <div key={i} className={`p-3 rounded-xl ${isUser ? 'bg-white/10' : 'bg-[var(--surface-glass)] backdrop-blur-sm border border-[var(--border-glass)]'}`}>
          <div className={`text-[10px] uppercase tracking-wide mb-1 ${isUser ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
            {stat.label}
          </div>
          <div className={`text-base font-semibold ${isUser ? 'text-white' : 'text-[var(--text-primary)]'}`}>
            {stat.value}
            {stat.trend && (
              <span className={`ml-1 text-xs ${stat.trend === 'up' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {stat.trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Text block with markdown formatting
function TextBlock({ content, isUser }: { content: string; isUser: boolean }) {
  const lines = content.split('\n')
  
  return (
    <>
      {lines.map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        line = line.replace(/\*(.+?)\*/g, '<em>$1</em>')
        
        // List items
        if (line.match(/^[-•*]\s/)) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className={isUser ? 'text-white/60' : 'text-primary'}>•</span>
              <span dangerouslySetInnerHTML={{ __html: line.replace(/^[-•*]\s/, '') }} />
            </div>
          )
        }
        
        // Numbered list items
        if (line.match(/^\d+\.\s/)) {
          const num = line.match(/^(\d+)\./)?.[1]
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className={`${isUser ? 'text-white/60' : 'text-primary'} font-medium`}>{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '') }} />
            </div>
          )
        }
        
        // Headers
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className="font-semibold text-sm mt-3 mb-1">
              {line.replace('### ', '')}
            </h4>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="font-semibold text-base mt-3 mb-1">
              {line.replace('## ', '')}
            </h3>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={i} className="font-bold text-lg mt-3 mb-1">
              {line.replace('# ', '')}
            </h2>
          )
        }
        
        // Empty lines
        if (!line.trim()) {
          return <div key={i} className="h-2" />
        }
        
        // Regular text
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
        )
      })}
    </>
  )
}
