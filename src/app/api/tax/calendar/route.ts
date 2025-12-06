import { NextResponse } from 'next/server'
import { getUpcomingTaxEvents, updateTaxEventStatus } from '../../../../lib/tax/calendar'

// AC #5: Tax Event API - GET upcoming events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') ?? '90', 10)
    
    const result = await getUpcomingTaxEvents(undefined, days)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Tax calendar API error:', error)
    return NextResponse.json(
      { success: false, events: [], error: 'Failed to fetch tax events' },
      { status: 500 }
    )
  }
}

// Update event status (done, dismissed, not_applicable)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventId, status } = body
    
    if (!eventId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing eventId or status' },
        { status: 400 }
      )
    }
    
    if (!['done', 'not_applicable', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    const result = await updateTaxEventStatus(eventId, status)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Tax calendar update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tax event' },
      { status: 500 }
    )
  }
}
