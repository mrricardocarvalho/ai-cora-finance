"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../../../components/ui/toast-provider'

export default function SettingsDataPage(){
  const toast = useToast()
  const router = useRouter()
  async function exportData(){
    try{
      const res = await fetch('/api/user/export')
      const json = await res.json()
      if(!json?.success){ toast('error', json?.error || 'Falha ao exportar'); return }
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cora-export-${new Date().toISOString()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('success', 'Exportação iniciada')
    }catch(e){ console.error(e); toast('error', 'Falha ao exportar') }
  }

  async function deleteAccount(){
    const confirm = window.prompt('Escreve ELIMINAR para eliminar permanentemente a tua conta')
    if(confirm !== 'ELIMINAR') return
    try{
      const res = await fetch('/api/user/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm }) })
      const json = await res.json()
      if(!json?.success){ toast('error', json?.error || 'Falha ao eliminar'); return }
      toast('success', 'Conta eliminada')
      router.push('/login')
    }catch(e){ console.error(e); toast('error', 'Falha ao eliminar') }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Dados e Privacidade</h1>
      <p className="mt-2 text-[var(--text-secondary)]">Exporta os teus dados ou elimina a tua conta.</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
          <h3 className="text-md font-semibold text-[var(--text-primary)]">Exportar Dados</h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">Descarrega um ficheiro JSON com o teu perfil, contas, transações, investimentos e objetivos.</p>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={exportData}>Exportar Dados</button>
          </div>
        </div>
        <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
          <h3 className="text-md font-semibold text-[var(--text-primary)]">Eliminar Conta</h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">Esta ação irá eliminar permanentemente a tua conta e todos os dados associados.</p>
          <div className="mt-3">
            <button className="btn btn-danger" onClick={deleteAccount}>Eliminar Conta</button>
          </div>
        </div>
      </div>
    </div>
  )
}
