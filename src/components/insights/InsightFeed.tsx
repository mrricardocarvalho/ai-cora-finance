"use client"
import React, { useState } from 'react'
import { mutate } from 'swr'
import InsightCard from '../../components/InsightCard'
import type { InsightRow } from '../../lib/intelligence/insights'
import type { ActionResult } from '../../lib/actions/insights'
import { dismissInsight, actInsight } from '../../lib/actions/insights'
import Button from '../ui/button'
import { useToast } from '../ui/toast-provider'
import { useRouter } from 'next/navigation'
import { useTranslations } from '../../lib/i18n'

export default function InsightFeed({ initial = [] }:{ initial?: InsightRow[] }){
  const [insights, setInsights] = useState(initial)
  const toast = useToast()
  const router = useRouter()
  const t = useTranslations()

  async function handleDismiss(id:string){
    setInsights(prev => prev.filter(p=>p.id !== id))
    try{
      const res = await dismissInsight(id) as ActionResult
      if(!res.success){ toast('error', `${t.insights.dismissFailed}: ${res.error || 'unknown'}`); }
      // refresh shared insights cache
      mutate('/api/insights')
    } catch(e){ console.error(e); toast('error', t.insights.dismissFailed) }
  }

  async function handleAct(id:string, action_link?:string){
    // optimistic: mark as acted locally
    setInsights(prev => prev.map(p => p.id === id ? { ...p, status: 'acted' } : p))
    try{
      const res = await actInsight(id) as ActionResult
      if(!res.success){ toast('error', `${t.insights.actFailed}: ${res.error || 'unknown'}`); return }
      // show toast for +5 Health Score
      toast('success', t.insights.healthScoreBonus)
      // optimistic: remove the acted insight from the feed
      setInsights(prev => prev.filter(p => p.id !== id))
      // refresh shared insights cache
      mutate('/api/insights')
      if(action_link) router.push(action_link)
    } catch(e){ console.error(e); toast('error', t.insights.actFailed) }
  }

  if(!insights || insights.length === 0) return (
    <div className="p-6 text-center bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl shadow-glass">
      <div className="text-3xl mb-2">🎉</div>
      <div className="text-[var(--text-on-glass)] font-medium">{t.insights.allCaughtUp}</div>
      <div className="mt-1 text-sm text-[var(--text-muted)]">{t.insights.noInsightsAtThisTime}</div>
    </div>
  )

  return (
    <div className="space-y-3">
      {insights.map(i => (
        <InsightCard id={i.id} key={i.id} priority={i.type as 'urgent'|'warning'|'opportunity'|'info'|'tax'} title={i.title} message={i.message} timestamp={i.created_at} scoreImpact={i.score_impact as number | undefined} onDismiss={handleDismiss} actions={(
          <>
            <Button aria-label={`${t.insights.act} ${i.title}`} variant="secondary" size="sm" onClick={()=>handleAct(i.id, i.action_link)}>{i.action_link ? t.insights.view : t.insights.act}</Button>
            <Button aria-label={`${t.insights.dismiss} ${i.title}`} variant="ghost" size="sm" onClick={()=>handleDismiss(i.id)}>{t.insights.dismiss}</Button>
          </>
        )} />
      ))}
    </div>
  )
}
