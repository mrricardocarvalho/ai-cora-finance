/**
 * OpenRouter API Client
 * 
 * Provides access to various AI models through OpenRouter.
 * Used as an alternative to OpenAI for transaction extraction.
 */

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterChoice {
  message: {
    content: string
  }
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[]
  error?: {
    message: string
  }
}

// Default model - can be changed by user preference
//const DEFAULT_MODEL = 'anthropic/claude-3-haiku'
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: string = DEFAULT_MODEL,
  maxTokens: number = 4000,
  temperature: number = 0.1, // Low temperature for consistent extraction, use 0.7 for chat
  timeoutMs: number = 30000 // 30 second timeout by default
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not set. Please add it to your .env file.')
  }

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Cora Finance'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data: OpenRouterResponse = await response.json()
    
    if (data.error) {
      throw new Error(`OpenRouter error: ${data.error.message}`)
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter')
    }

    return data.choices[0].message.content
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`OpenRouter request timed out after ${timeoutMs}ms`)
    }
    throw error
  }
}

/**
 * Available models on OpenRouter
 * Users can select their preferred model
 */
export const AVAILABLE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', default: true },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Fast & Cheap)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Best Quality)' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5 (Fast)' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'mistralai/mistral-small', name: 'Mistral Small' }
] as const

export type OpenRouterModel = typeof AVAILABLE_MODELS[number]['id']
