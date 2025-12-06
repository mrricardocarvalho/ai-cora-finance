"use client"
import React from 'react'

export default function ServiceWorkerRegister(){
  React.useEffect(()=>{
    if(typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production'){
      navigator.serviceWorker.register('/sw.js').catch(e=>console.warn('SW register failed', e))
    }
  }, [])
  return null
}
