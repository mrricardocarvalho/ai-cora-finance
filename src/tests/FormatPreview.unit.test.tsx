import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import FormatPreview from '../components/ui/format-preview'
import { formatCurrency } from '../lib/utils'

describe('FormatPreview', ()=>{
  test('renders formatted currency for numeric value', ()=>{
    render(<FormatPreview value={1234.56} />)
    expect(screen.getByText(formatCurrency(1234.56))).toBeInTheDocument()
  })
  test('renders formatted currency for localized string value', ()=>{
    render(<FormatPreview value={'1.234,56'} />)
    expect(screen.getByText(formatCurrency(1234.56))).toBeInTheDocument()
  })
  test('handles negative format (parentheses)', ()=>{
    render(<FormatPreview value={'(1.234,56)'} />)
    expect(screen.getByText(formatCurrency(-1234.56))).toBeInTheDocument()
  })
})
