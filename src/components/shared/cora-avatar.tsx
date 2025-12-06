"use client"
import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export type AvatarState = 'idle'|'thinking'|'speaking'|'happy'

export default function CoraAvatar({ state = 'idle', size = 32 }:{ state?: AvatarState; size?: number }){
  const [local, setLocal] = React.useState<AvatarState | undefined>(undefined)
  const variants = {
    idle: { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 3 } },
    thinking: { opacity: [0.6, 1, 0.6], transition: { repeat: Infinity, duration: 1.2 } },
    speaking: { rotate: [0, 6, -6, 0], transition: { repeat: Infinity, duration: 1.4 } },
    happy: { y: [0, -6, 0], transition: { repeat: 1, duration: 0.6 } }
  }
  const sizeClass = `w-${size} h-${size}`
  const shouldReduceMotion = useReducedMotion()
  React.useEffect(()=>{
    function onCelebrate(){
      setLocal('happy')
      setTimeout(()=> setLocal(undefined), 1200)
    }
    if(typeof window !== 'undefined'){
      window.addEventListener('cora:celebrate', onCelebrate as EventListener)
    }
    return ()=>{ if(typeof window !== 'undefined') window.removeEventListener('cora:celebrate', onCelebrate as EventListener) }
  }, [])
  const animState = shouldReduceMotion ? state : (local || state)
  return (
    <motion.div 
      data-testid="cora-avatar-root" 
      data-cora-state={local || state} 
      animate={animState} 
      variants={variants} 
      className="rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg" 
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.15" />
        <path d="M8 15c1.5-1.5 4.5-1.5 6 0" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="10" r="1.2" fill="#fff" />
        <circle cx="15" cy="10" r="1.2" fill="#fff" />
      </svg>
    </motion.div>
  )
}
