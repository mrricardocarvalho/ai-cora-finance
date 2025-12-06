import { NextResponse } from 'next/server'
import { parseStatementPDF } from '../../../lib/actions/upload'

// Simple in-memory rate limiter per IP (works in long-running server; ephemeral in serverless)
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 6
const _ipCounters: Record<string, { count: number; resetAt: number }> = {}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const entry = _ipCounters[ip] || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + RATE_LIMIT_WINDOW_MS }
    entry.count += 1
    _ipCounters[ip] = entry
    if (entry.count > RATE_LIMIT_MAX) return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
    const form: FormData = await req.formData()
    const result = await parseStatementPDF(form)
    return NextResponse.json(result)
  } catch (err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) message = err.message
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
