'use server'
import getOpenAIClient from './openai'
import { TransactionExtractionSchema } from './schemas'
import { systemPrompt, sampleInstruction } from './prompts'

export async function extractTransactionsFromText(text: string){
  if(!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set')
  const prompt = `${sampleInstruction}\n\nTEXT:\n${text}`

  // Call OpenAI responses API
  const client = getOpenAIClient()
  const res = await client.responses.create({
    model: 'gpt-4o-mini',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_output_tokens: 2000,
  })

  // responses API returns an array in `res.output`; extract textual content safely
  let assistant = ''
  if (Array.isArray(res.output)) {
    assistant = res.output.map(o => {
      if (typeof o === 'string') return o
      const item = o as { content?: Array<{ text?: string }> }
      if (item.content && Array.isArray(item.content)) {
        const txts = item.content.map(b => b?.text || '').filter(Boolean)
        return txts.join('\n')
      }
      return ''
    }).join('\n')
  } else {
    // Fallback - try to extract text more defensively
    const output = res.output as unknown
    const outArr = output as unknown[]
    if (Array.isArray(outArr) && outArr.length > 0) {
      const first = outArr[0] as { content?: Array<{ text?: string }> } | string
      assistant = typeof first === 'string' ? first : (first.content?.[0]?.text ?? '')
    } else {
      assistant = ''
    }
  }
  if(!assistant) throw new Error('Empty AI response')

  // parse JSON from assistant response
  let parsed: unknown
  try{
    // attempt to locate JSON in the response
    const jsonStart = assistant.indexOf('{')
    const json = assistant.slice(jsonStart)
    parsed = JSON.parse(json)
  } catch {
    throw new Error('AI returned invalid JSON')
  }

  const zres = TransactionExtractionSchema.safeParse(parsed)
  if(!zres.success) throw new Error('AI output failed schema: '+ zres.error.message)
  return zres.data
}
