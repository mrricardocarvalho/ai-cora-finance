import { NextResponse } from 'next/server'
import { parseStatementPDF } from '../../../lib/actions/upload'

export async function POST(req: Request) {
  try {
    const form: FormData = await req.formData()
    const result = await parseStatementPDF(form)
    return NextResponse.json(result)
  } catch (err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) message = err.message
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
