import React from 'react'
import { render, screen } from '@testing-library/react'
import { ConceptLibrary } from '../../components/education/ConceptLibrary'
import { LearningProvider } from '../../components/education/LearningContext'
import { ExampleCalculation } from '../../components/education/examples/ExampleCalculation'

// Mock the LearningContext to avoid provider issues if necessary
// But since we wrap it in LearningProvider, it should be fine if we mock the initial state or just let it be default.

describe('Education Components', () => {
  it('renders ConceptLibrary without crashing', () => {
    render(
      <LearningProvider>
        <ConceptLibrary />
      </LearningProvider>
    )
    // Check for some text that should be present
    expect(screen.getByText(/Investing/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search concepts/i)).toBeInTheDocument()
  })

  it('renders ExampleCalculation for compound-interest', () => {
    render(<ExampleCalculation type="compound-interest" />)
    expect(screen.getByText(/Interactive Simulator/i)).toBeInTheDocument()
    expect(screen.getByText(/Initial Investment/i)).toBeInTheDocument()
  })

  it('renders ExampleCalculation for emergency-fund', () => {
    render(<ExampleCalculation type="emergency-fund" />)
    expect(screen.getByText(/Emergency Fund Calculator/i)).toBeInTheDocument()
  })
})
