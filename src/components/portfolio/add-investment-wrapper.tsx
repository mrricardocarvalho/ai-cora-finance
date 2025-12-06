"use client"
import React from 'react'
import AddInvestmentDialog from './add-investment-dialog'
import Button from '../ui/button'

export default function AddInvestmentWrapper(){
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <div className="flex justify-end"><Button onClick={()=>setOpen(true)}>Add Investment</Button></div>
      <AddInvestmentDialog open={open} onClose={()=>setOpen(false)} />
    </>
  )
}
