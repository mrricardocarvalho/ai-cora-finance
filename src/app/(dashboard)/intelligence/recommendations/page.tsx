import React from 'react'
import { Metadata } from 'next'
import RecommendationsPageClient from './client'

export const metadata: Metadata = {
  title: 'Smart Recommendations | Cora Finance',
  description: 'AI-driven insights to improve your financial health.',
}

export default function RecommendationsPage() {
  return <RecommendationsPageClient />
}
