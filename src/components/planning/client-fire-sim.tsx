"use client"
import React from 'react'
import FireSimulator from './fire-simulator'
import { useEffect, useState } from 'react'

export default function ClientFIRESim(){
  const [initial, setInitial] = useState<any>(undefined)
  useEffect(()=>{
    async function load(){
      try{ const res = await fetch('/api/planning/calculate-fire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); const json = await res.json(); if(json?.success) setInitial(json.data) }catch(e){ console.error(e) }
    }
    load()
  }, [])
  return <FireSimulator initial={initial} />
}
