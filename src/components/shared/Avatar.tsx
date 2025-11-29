"use client"
import React from 'react'

export default function Avatar(){
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">A</button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow p-2">
          <button className="w-full text-left p-2 text-sm">Sign Out</button>
        </div>
      )}
    </div>
  )
}
