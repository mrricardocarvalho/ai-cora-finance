"use client"
import React from 'react'
import { Lock, Unlock } from 'lucide-react'
import { useTranslations } from '../../lib/i18n'

 
export default function PrivacyShield(){
  const t = useTranslations()
  const [state, setState] = React.useState<{ encrypted?: boolean; dbConnected?: boolean; rlsEnabled?: boolean; region?: string } | null>(null)
  React.useEffect(()=>{
    (async ()=>{
      try{
        const res = await fetch('/api/status/privacy')
        const json = await res.json()
        if(json?.success) setState({ encrypted: json.encrypted, dbConnected: json.dbConnected, rlsEnabled: json.rlsEnabled, region: json.region })
        else setState({})
      }catch(e){
        setState({})
      }
    })()
  }, [])
  if(!state) return <div className="text-sm text-[var(--text-muted)]">{t.privacy.checking}</div>
  const ok = state.encrypted && state.dbConnected && state.rlsEnabled
  return (
    <div className="flex items-center gap-2">
      <div className={`p-2 rounded-full ${ok ? 'bg-[var(--success-glass)] text-[var(--success)]' : 'bg-[var(--danger-glass)] text-[var(--danger)]'}`}>
        {ok ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
      </div>
      <div className="text-sm">
        <div className={`${ok ? 'text-[var(--success)]' : 'text-[var(--danger)]'} font-semibold`}>{ok ? t.privacy.encrypted : t.privacy.checkSecurity}</div>
        <div className="text-xs text-[var(--text-muted)]">{state.region ? `${t.privacy.region}: ${state.region}` : t.privacy.unknownRegion}</div>
      </div>
    </div>
  )
}
