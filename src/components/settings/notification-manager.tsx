"use client"
import React from 'react'
import { useToast } from '../ui/toast-provider'

declare const process: { env: { NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string, NODE_ENV?: string } }

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationManager(){
  const [permission, setPermission] = React.useState(Notification.permission)
  const [subscribed, setSubscribed] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()

  React.useEffect(()=>{
    setPermission(Notification.permission)
    // check if subscribed by calling server or checking pushManager
    ;(async ()=>{
      try{
        if (process.env.NODE_ENV !== 'production') return
        const reg = await navigator.serviceWorker.getRegistration()
        if(reg){
          const push = await reg.pushManager.getSubscription()
          setSubscribed(Boolean(push))
        }
      }catch(e){ console.warn(e) }
    })()
  }, [])

  async function subscribe(){
    if(!('serviceWorker' in navigator) || !('PushManager' in window)){
      toast('error', 'Push API não suportado neste browser')
      return
    }
    setLoading(true)
    try{
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if(perm !== 'granted') { toast('error', 'Permissão negada'); setLoading(false); return }
      if (process.env.NODE_ENV !== 'production') { toast('error', 'Push não suportado em desenvolvimento'); setLoading(false); return }
      const reg = await navigator.serviceWorker.register('/sw.js')
      // Get public key from server in case env not injected
      const pkRes = await fetch('/api/notifications/public-key')
      const pkJson = await pkRes.json()
      const publicKey = pkJson?.success ? pkJson.publicKey : undefined
      if(!publicKey){ toast('error', 'Chave pública em falta'); setLoading(false); return }
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })
      // publicKey already checked above
      // Send to server
      const res = await fetch('/api/notifications/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription }) })
      const json = await res.json()
      if(json?.success){ setSubscribed(true); toast('success', 'Notificações ativadas') }
      else toast('error', json?.error || 'Falha ao subscrever')
    }catch(e){ console.error(e); toast('error', (e as any)?.message || 'Unknown') }
    finally{ setLoading(false) }
  }

  async function unsubscribe(){
    setLoading(true)
    try{
      const reg = await navigator.serviceWorker.getRegistration()
      if(reg){
        const push = await reg.pushManager.getSubscription()
        if(push){ await push.unsubscribe() }
      }
      const res = await fetch('/api/notifications/unsubscribe', { method: 'DELETE' })
      const json = await res.json()
      if(json?.success){ setSubscribed(false); toast('success', 'Notificações desativadas') }
      else toast('error', json?.error || 'Falha ao cancelar subscrição')
    }catch(e){ console.error(e); toast('error', (e as any)?.message || 'Unknown') }
    finally{ setLoading(false) }
  }

  async function sendTest(){
    setLoading(true)
    try{
      const res = await fetch('/api/notifications/send-test', { method: 'POST' })
      const json = await res.json()
      if(json?.success) toast('success', 'Notificação de teste enviada')
      else toast('error', json?.error || 'Falha ao enviar teste')
    }catch(e){ console.error(e); toast('error', (e as any)?.message || 'Unknown') }
    finally{ setLoading(false) }
  }

  return (
    <div className="p-4 border border-[var(--border)] rounded-xl bg-surface shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm">Notificações</div>
          <div className="text-xs text-[var(--text-muted)]">Receber notificações push para atualizações importantes</div>
        </div>
        <div>
          {subscribed ? <button className="btn btn-ghost" onClick={unsubscribe} disabled={loading}>Desativar</button> : <button className="btn btn-primary" onClick={subscribe} disabled={loading || permission !== 'granted' && permission !== 'default'}>Ativar</button>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn" onClick={sendTest} disabled={!subscribed || loading}>Enviar Teste</button>
        {process.env.NODE_ENV === 'development' && <button className="btn btn-ghost" onClick={sendTest} disabled={loading}>Teste Dev</button>}
      </div>
    </div>
  )
}
