"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import CoraAvatar from './cora-avatar'

interface CoraPromptProps {
  /** The message Cora says */
  message: string
  /** Button text for the action */
  actionLabel: string
  /** Navigation target */
  href?: string
  /** Click handler (alternative to href) */
  onClick?: () => void
  /** Optional variant */
  variant?: 'default' | 'success' | 'info'
}

/**
 * CoraPrompt - Contextual next-step prompts from Cora
 * 
 * Usage:
 * - After account creation: "Great! Now upload a statement for this account."
 * - After statement upload: "I found X transactions. Want to review the categories?"
 * - After onboarding: "Let's connect your first bank account."
 */
export default function CoraPrompt({ 
  message, 
  actionLabel, 
  href, 
  onClick,
  variant = 'default' 
}: CoraPromptProps) {
  const variantStyles = {
    default: 'from-[var(--primary)]/10 to-[var(--accent)]/10 border-[var(--primary)]/20',
    success: 'from-[var(--success)]/10 to-[var(--success)]/5 border-[var(--success)]/20',
    info: 'from-[var(--info)]/10 to-[var(--info)]/5 border-[var(--info)]/20'
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${variantStyles[variant]} border`}
    >
      <CoraAvatar state="idle" size={36} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-primary)]">{message}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] whitespace-nowrap">
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className="w-full text-left hover:opacity-90 transition-opacity">
      {content}
    </button>
  )
}

// Pre-built prompt configurations for common scenarios
export const CORA_PROMPTS = {
  afterAccountCreation: (accountName: string) => ({
    message: `Great! Now upload a statement for ${accountName}.`,
    actionLabel: 'Upload Statement',
    href: '/data'
  }),
  afterStatementUpload: (count: number) => ({
    message: `I found ${count} transactions. Want to review the categories?`,
    actionLabel: 'Review',
    href: '/data?tab=transactions'
  }),
  afterOnboarding: {
    message: "Let's connect your first bank account.",
    actionLabel: 'Add Account',
    href: '/data'
  },
  afterBulkEdit: {
    message: 'Nice! Your spending insights are updating...',
    actionLabel: 'View Insights',
    href: '/'
  },
  afterGoalCreation: {
    message: "I'll track your progress and remind you along the way.",
    actionLabel: 'View Goals',
    href: '/planning/goals'
  },
  afterDebtEntry: {
    message: "I'll calculate the best payoff strategy for you.",
    actionLabel: 'View Strategy',
    href: '/planning/debt'
  },
  noAccounts: {
    message: "Let's add your first account to get started.",
    actionLabel: 'Add Account',
    href: '/data'
  },
  noTransactions: {
    message: 'Upload a statement to see your spending insights.',
    actionLabel: 'Upload Statement',
    href: '/data'
  },
  allCaughtUp: {
    message: "You're all caught up! I'll notify you when something needs attention.",
    actionLabel: 'Ask me anything',
    href: '/chat'
  }
} as const
