import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { calculateCashFlowForecast, type WhatIfScenario } from '../../../../lib/intelligence/forecast'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)
    
    // Parse what-if scenarios from query params
    const whatIfParam = searchParams.get('whatIf')
    let whatIfScenarios: WhatIfScenario[] = []
    
    if (whatIfParam) {
      try {
        whatIfScenarios = JSON.parse(whatIfParam)
      } catch (e) {
        // Ignore invalid JSON
      }
    }

    const forecast = await calculateCashFlowForecast(user.id, days, whatIfScenarios)
    
    return NextResponse.json(forecast)
  } catch (error) {
    console.error('Forecast API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
