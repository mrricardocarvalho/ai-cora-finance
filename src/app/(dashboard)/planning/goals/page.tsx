import React from 'react'
import { getGoals } from '../../../../lib/actions/goals'
import { getAccounts } from '../../../../lib/actions/accounts'
import GoalsPageClient from './client'

export default async function GoalsPage(){
  const goalsRes = await getGoals()
  const accountsRes = await getAccounts()
  const goals = goalsRes?.success ? goalsRes.data : []
  const accounts = accountsRes?.success ? accountsRes.data : []
  
  return (
    <GoalsPageClient 
      goals={goals || []} 
      accounts={accounts || []} 
    />
  )
}
