import React from 'react'
import InsightCard from '../../../components/InsightCard'

export default function DashboardIndex(){
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Dashboard — Deep Insights</h1>
      <p className="mt-2 text-slate-600">Charts and KPIs live here.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard priority={'opportunity'} title="Sample KPI" message="Placeholder card" />
        <InsightCard priority={'urgent'} title="Sample KPI" message="Placeholder card" />
        <InsightCard priority={'info'} title="Sample KPI" message="Placeholder card" />
      </div>
    </div>
  )
}
