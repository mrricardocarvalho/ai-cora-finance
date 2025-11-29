import React from 'react'

type P = { priority: 'urgent' | 'warning' | 'opportunity' | 'tax' | 'info'; title: string; message: string; timestamp?: string }

export default function InsightCard({ priority, title, message, timestamp }: P) {
  const cls = `p-3 border rounded-md ${priority === 'tax' ? 'border-[#E17055]' : priority === 'urgent' ? 'border-[#F43F5E]' : priority === 'opportunity' ? 'border-[#10B981]' : 'border-slate-200'}`
  return (
    <article className={cls}>
      <div className="flex justify-between">
        <h3 className="font-medium">{title}</h3>
        <time className="text-xs text-slate-500">{timestamp}</time>
      </div>
      <p className="mt-1 text-sm text-slate-700">{message}</p>
    </article>
  )
}
