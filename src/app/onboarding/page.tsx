import React from 'react'

export default function OnboardingPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Onboarding (Protected)</h1>
      <p className="mt-2 text-slate-600">Complete onboarding steps here. This route is protected by middleware.</p>
    </div>
  )
}
