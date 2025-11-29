"use client"
import React, { useState } from 'react'
import Button from '../ui/Button'

export default function StatementUpload({ accounts }: { accounts?: { id: string, name?: string }[]}){
  const [fileName, setFileName] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [insertCount, setInsertCount] = useState<number | null>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>){
    setError(null)
    setText(null)
    const f = e.target.files?.[0]
    if(!f) return
    setFileName(f.name)
    // validate
    if(!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf'){
      setError('Only PDF files are accepted')
      return
    }
    const maxSize = 5 * 1024 * 1024
    if(f.size > maxSize){ setError('File too large (max 5MB)'); return }
    setProcessing(true)
    try{
      const fd = new FormData()
      fd.append('file', f)
      if(accounts && accounts.length>0){
        // append selected account id if present in select input
        const sel = (document.getElementById('select-account') as HTMLSelectElement | null)?.value
        if(sel) fd.append('account_id', sel)
      }
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data: { success?: boolean, text?: string, inserted?: number, error?: string } = await res.json()
      if(!res.ok) throw new Error(data.error || 'Parsing failed')
      setText(data.text || '')
      if (data.inserted) setInsertCount(Number(data.inserted))
    } catch(err: unknown){
      if (err instanceof Error) setError(err.message)
      else setError(String(err))
    }
    finally{ setProcessing(false) }
  }

  const inputId = React.useId()
  const selectId = React.useId()
  return (
    <div className="p-4 border rounded space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium">Upload PDF Statement</label>
      <input id={inputId} title="Upload PDF statement" type="file" accept="application/pdf" onChange={onChange} />
      {accounts && accounts.length>0 && (
        <div className="mt-2">
          <label htmlFor={selectId} className="block text-xs text-slate-600">Associate transactions to account</label>
          <select id={selectId} className="block mt-1">
            <option value="">-- Select account --</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
          </select>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <Button variant="ghost" onClick={()=>{document.querySelector<HTMLInputElement>('input[type=file]')?.click()}}>Choose File</Button>
        <div className="text-sm text-slate-500">{fileName || 'No file selected'}</div>
      </div>
      {processing && <div className="text-sm text-slate-500">Processing...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {text && (
        <div className="mt-2 p-2 border rounded bg-slate-50">
          <div className="text-sm text-slate-700">Extracted {text.length} characters</div>
          <pre className="mt-2 text-xs max-h-40 overflow-auto">{text}</pre>
        </div>
      )}
      {insertCount !== null && <div className="text-sm text-green-600">Inserted {insertCount} transactions</div>}
    </div>
  )
}
