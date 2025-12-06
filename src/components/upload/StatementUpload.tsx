"use client"
import React, { useState, useRef } from 'react'
import Button from '../ui/button'
import { mutate } from 'swr'
import { useNetworkStatus } from '../shared/network-status'
import { useTranslations } from '../../lib/i18n'

interface AccountBreakdown {
  account_name: string
  account_type: string
  count: number
}

interface UploadResponse {
  success?: boolean
  text?: string
  inserted?: number
  error?: string
  accountBreakdown?: AccountBreakdown[]
  isMultiAccount?: boolean
  parsingMethod?: 'regex' | 'ai'
  isMoeyDetected?: boolean
}

type ParsingMethod = 'auto' | 'regex' | 'ai'

const AI_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Fast)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Best)' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
] as const

export default function StatementUpload({ accounts }: { accounts?: { id: string, name?: string }[]}){
  const t = useTranslations()
  const online = useNetworkStatus()
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined)
  const [processing, setProcessing] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parsingMethod, setParsingMethod] = useState<ParsingMethod>('auto')
  const [aiModel, setAiModel] = useState<string>('meta-llama/llama-3.3-70b-instruct:free')
  const [insertedCount, setInsertedCount] = useState<number | null>(null)
  const [accountBreakdown, setAccountBreakdown] = useState<AccountBreakdown[] | null>(null)
  const [isMultiAccount, setIsMultiAccount] = useState(false)
  const [methodUsed, setMethodUsed] = useState<'regex' | 'ai' | null>(null)
  const [isMoeyDetected, setIsMoeyDetected] = useState(false)

  const inputId = React.useId()
  const selectId = React.useId()
  const methodId = React.useId()
  const modelId = React.useId()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  
  // Handle file selection - store file but don't process yet
  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    setText(null)
    setInsertedCount(null)
    setAccountBreakdown(null)
    setIsMultiAccount(false)
    setMethodUsed(null)
    setIsMoeyDetected(false)
    
    const f = e.target.files?.[0]
    if (!f) return
    
    // Validate
    if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') {
      setError(t.upload.onlyPdf)
      return
    }
    const maxSize = 5 * 1024 * 1024
    if (f.size > maxSize) { 
      setError(t.upload.fileTooLarge)
      return 
    }
    
    setFileName(f.name)
    setPendingFile(f)
  }
  
  // Process the pending file
  async function processFile(shouldImport: boolean) {
    if (!pendingFile) return
    
    setProcessing(true)
    setError(null)
    
    try {
      const fd = new FormData()
      fd.append('file', pendingFile)
      if (accounts && accounts.length > 0 && selectedAccount) {
        fd.append('account_id', selectedAccount)
      }
      fd.append('process_transactions', String(shouldImport))
      fd.append('parsing_method', parsingMethod)
      if (parsingMethod === 'ai' || parsingMethod === 'auto') {
        fd.append('ai_model', aiModel)
      }
      
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data: UploadResponse = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Parsing failed')
      
      setText(data.text || '')
      if (data.inserted) setInsertedCount(Number(data.inserted))
      if (data.accountBreakdown) setAccountBreakdown(data.accountBreakdown)
      if (data.isMultiAccount) setIsMultiAccount(true)
      if (data.parsingMethod) setMethodUsed(data.parsingMethod)
      if (data.isMoeyDetected) setIsMoeyDetected(true)
      
      if (data.inserted) {
        try { 
          mutate('/api/transactions?pageSize=5')
          mutate('/api/transactions?pageSize=20')
          mutate('/api/insights')
          mutate('/api/accounts')
          mutate('/api/intelligence/safe-to-spend')
        } catch(e) { /* ignore */ }
        setPendingFile(null) // Clear file after successful import
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError(String(err))
    } finally {
      setProcessing(false)
    }
  }
  
  return (
    <div className="p-4 border border-[var(--border)] rounded-xl bg-surface space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-primary)]">{t.upload.title}</label>
      <input 
        id={inputId} 
        title="Upload PDF statement" 
        type="file" 
        accept="application/pdf" 
        ref={fileInputRef} 
        onChange={onFileSelect} 
        disabled={processing || !online} 
        className="hidden" 
      />
      
      {/* Step 1: Choose File */}
      <div className="flex gap-2 items-center">
        <Button variant="ghost" onClick={()=>{fileInputRef.current?.click()}} disabled={processing || !online}>
          📄 {t.upload.chooseFile}
        </Button>
        <div className="text-sm text-[var(--text-muted)]">{fileName || t.upload.noFileSelected}</div>
      </div>

      {/* Step 2: Show options and actions when file is selected */}
      {pendingFile && (
        <div className="p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl space-y-3">
          <div className="text-sm font-medium text-[var(--primary)]">📋 {t.upload.fileReady}: {fileName}</div>
          
          {/* Parsing Method */}
          <div>
            <label htmlFor={methodId} className="block text-xs text-[var(--text-secondary)] mb-1">{t.upload.processingMethod}</label>
            <select 
              id={methodId} 
              value={parsingMethod} 
              onChange={(e) => setParsingMethod(e.target.value as ParsingMethod)}
              disabled={processing}
              className="block w-full text-sm border border-[var(--border)] rounded-xl p-2 bg-surface text-[var(--text-primary)]"
            >
              <option value="auto">🔄 {t.upload.autoMethod}</option>
              <option value="regex">⚡ {t.upload.regexMethod}</option>
              <option value="ai">🤖 {t.upload.aiMethod}</option>
            </select>
          </div>

          {/* AI Model Selection */}
          {(parsingMethod === 'ai' || parsingMethod === 'auto') && (
            <div>
              <label htmlFor={modelId} className="block text-xs text-[var(--text-secondary)] mb-1">{t.upload.aiModel}</label>
              <select 
                id={modelId}
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                disabled={processing}
                className="block w-full text-sm border border-[var(--border)] rounded-xl p-2 bg-surface text-[var(--text-primary)]"
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Account Selection */}
          {accounts && accounts.length > 0 && (
            <div>
              <label htmlFor={selectId} className="block text-xs text-[var(--text-secondary)] mb-1">
                {t.upload.targetAccount}
              </label>
              <select 
                id={selectId} 
                value={selectedAccount} 
                onChange={(e)=>setSelectedAccount(e.target.value)} 
                disabled={processing}
                className="block w-full text-sm border border-[var(--border)] rounded-xl p-2 bg-surface text-[var(--text-primary)]"
              >
                <option value="">-- {t.upload.autoDetect} --</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => processFile(true)} 
              disabled={processing}
            >
              {processing ? `⏳ ${t.upload.importing}` : `✅ ${t.upload.importTransactions}`}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => processFile(false)} 
              disabled={processing}
            >
              👁️ {t.upload.preview}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => { setPendingFile(null); setFileName(null) }} 
              disabled={processing}
            >
              ✕ {t.common.cancel}
            </Button>
          </div>
        </div>
      )}

      {processing && <div className="text-sm text-[var(--primary)] animate-pulse">⏳ {t.upload.processing}</div>}
      {!online && <div className="text-sm text-[var(--warning)]">⚠️ {t.upload.offline}</div>}
      
      {error && <div className="text-sm text-[var(--danger)] p-2 bg-[var(--danger)]/10 rounded-xl">❌ {error}</div>}
      
      {/* Preview mode result */}
      {text && insertedCount === null && (
        <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
          <div className="text-sm text-[var(--text-secondary)]">📝 {t.upload.extracted} {text.length}</div>
          {isMoeyDetected && (
            <div className="text-xs text-[var(--primary)] mt-1">✨ {t.upload.moeyDetected}</div>
          )}
          <pre className="mt-2 text-xs max-h-40 overflow-auto bg-surface p-2 rounded-lg border border-[var(--border)] text-[var(--text-primary)]">{text}</pre>
          {pendingFile && (
            <Button 
              onClick={() => processFile(true)} 
              disabled={processing}
              className="mt-2"
            >
              ✅ {t.upload.importNow}
            </Button>
          )}
        </div>
      )}
      
      {/* Success result */}
      {insertedCount !== null && insertedCount > 0 && (
        <div className="p-3 border border-[var(--success)]/30 rounded-xl bg-[var(--success)]/10">
          <div className="text-sm font-medium text-[var(--success)]">
            ✅ {t.upload.imported} {insertedCount} {t.transactions.title.toLowerCase()}
            {methodUsed && (
              <span className="ml-2 text-xs font-normal">
                ({t.upload.via} {methodUsed === 'regex' ? '⚡ Regex' : '🤖 AI'})
              </span>
            )}
          </div>
          {accountBreakdown && accountBreakdown.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="text-xs font-medium text-[var(--success)]">{t.upload.accountBreakdown}:</div>
              {accountBreakdown.map((acc, idx) => (
                <div key={idx} className="text-xs text-[var(--success)] pl-2">
                  • {acc.account_name} ({acc.account_type}): {acc.count} {t.transactions.title.toLowerCase()}
                </div>
              ))}
            </div>
          )}
          {isMultiAccount && (
            <div className="text-xs text-[var(--success)] mt-2">📊 {t.upload.multiAccountProcessed}</div>
          )}
        </div>
      )}
    </div>
  )
}
