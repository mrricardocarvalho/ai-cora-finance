import React from 'react'
import { Metadata } from 'next'
import ForecastPageClient from './client'

export const metadata: Metadata = {
  title: 'Cash Flow Forecast | Cora Finance',
  description: 'Predict your future balance based on recurring expenses and income patterns.',
}

export default function ForecastPage() {
  return <ForecastPageClient />
}
