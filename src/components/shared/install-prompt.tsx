"use client"
import React from 'react'
import { useTranslations } from '../../lib/i18n'

export default function InstallPrompt(){
  const t = useTranslations()
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [visible, setVisible] = React.useState(false)
  const [isiOS, setIsiOS] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(()=>{
    setMounted(true)
    // Check iOS after mount to avoid hydration mismatch
    setIsiOS(/iphone|ipad|ipod/i.test(navigator.userAgent))
    
    function beforeInstallHandler(e: any){ 
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
      ;(window as any).__CORA_DEFERRED_PROMPT = e 
    }
    window.addEventListener('beforeinstallprompt', beforeInstallHandler)
    return ()=> window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
  }, [])

  function onInstall(){
    if(!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult: any)=>{
      setVisible(false)
      setDeferredPrompt(null)
    })
  }

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) return null
  if (!visible && !isiOS) return null

  // iOS hint: use a subtle glass chip instead of a primary button
  if (isiOS) {
    return (
      <div className="rounded-full border border-[var(--border-glass)] bg-[var(--surface-glass)]/90 px-3 py-2 text-xs text-[var(--text-secondary)] shadow-glass backdrop-blur-lg">
        {t.install.iosInstructions}
      </div>
    )
  }

  // Default PWA install chip (lighter than main CTAs)
  return (
    <button
      onClick={onInstall}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border-glass)] bg-[var(--surface-glass)]/90 px-3 py-2 text-xs font-medium text-[var(--text-primary)] shadow-glass backdrop-blur-lg transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-elevated hover:bg-[var(--surface-elevated)]/95"
    >
      <span className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
      {t.install.installCora}
    </button>
  )
}

export function InstallButton(){
  const t = useTranslations()
  const onClick = React.useCallback(async ()=>{
    const dp = (window as any).__CORA_DEFERRED_PROMPT
    if(!dp) return
    dp.prompt()
    const choice = await dp.userChoice
    delete (window as any).__CORA_DEFERRED_PROMPT
  }, [])
  return <button className="btn" onClick={onClick}>{t.install.installCora}</button>
}
