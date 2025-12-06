import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AccountList from '../components/accounts/AccountList'
import { formatNumber } from '../lib/utils'

describe('AccountList', ()=>{
  test('displays interest rate formatted with formatNumber', ()=>{
    const accounts = [{ id: '1', name: 'Loan', type: 'loan', interest_rate: 3.5, balance: 1000, institution: 'Bank' }]
    render(<AccountList initialAccounts={accounts as any} />)
    expect(screen.getByText(`${formatNumber(3.5, 2)}% APR`)).toBeInTheDocument()
    expect(screen.getByText('Loan')).toBeInTheDocument()
  })
})
