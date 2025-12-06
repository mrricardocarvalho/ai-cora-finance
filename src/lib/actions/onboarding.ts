"use server"

import { callOpenRouter } from '../ai/openrouter'
import type { Locale } from '../i18n/translations'

export interface OnboardingStep {
  step: 'welcome' | 'comfort_floor' | 'worries' | 'goals' | 'risk' | 'complete'
  userInput?: string
  previousAnswers?: {
    comfort_floor?: number
    worries?: string[]
    goals?: string[]
    risk_tolerance?: string
  }
}

interface OnboardingResponse {
  success: boolean
  message: string
  suggestedOptions?: string[]
  error?: string
}

const ONBOARDING_SYSTEM_PROMPT = `You are Cora, a friendly and warm personal finance assistant helping a new user through onboarding.

## Your Personality
- Warm, encouraging, and conversational
- Use emojis sparingly but naturally (1-2 per message max)
- Explain WHY you're asking each question
- Keep responses concise (2-3 sentences max)
- Respond in the user's language

## Onboarding Flow Context
You're guiding the user through these steps:
1. Welcome - greet them warmly
2. Comfort Floor - their minimum balance threshold
3. Worries - their financial concerns
4. Goals - their financial goals
5. Risk Tolerance - investment risk preference
6. Complete - summarize what you learned

## Guidelines
- Acknowledge their previous answers naturally
- Make each transition feel conversational, not robotic
- If they share something personal, acknowledge it empathetically
- Always explain the PURPOSE of each question`

export async function generateOnboardingResponse(
  step: OnboardingStep,
  locale: Locale = 'pt-PT'
): Promise<OnboardingResponse> {
  const isPortuguese = locale === 'pt-PT'
  
  const languageInstruction = isPortuguese
    ? 'Respond in European Portuguese (PT-PT). Use informal "tu" form.'
    : 'Respond in English.'

  const stepPrompts: Record<string, string> = {
    welcome: isPortuguese
      ? 'Generate a warm welcome message. Introduce yourself as Cora, explain you\'ll help them understand their finances, and say you need to learn about them first. End by asking if they\'re ready to start.'
      : 'Generate a warm welcome message. Introduce yourself as Cora, explain you\'ll help them understand their finances, and say you need to learn about them first. End by asking if they\'re ready to start.',
    
    comfort_floor: isPortuguese
      ? 'Ask about their Comfort Floor - the minimum balance they never want to go below. Explain WHY this matters: "Assim posso avisar-te antes de gastares demais." Ask for an amount in euros.'
      : 'Ask about their Comfort Floor - the minimum balance they never want to go below. Explain WHY this matters: "This way I can warn you before you overspend." Ask for an amount in euros.',
    
    worries: isPortuguese
      ? 'Acknowledge their comfort floor choice, then ask about their main financial worries. Explain you\'ll focus your analysis on these areas. Be empathetic.'
      : 'Acknowledge their comfort floor choice, then ask about their main financial worries. Explain you\'ll focus your analysis on these areas. Be empathetic.',
    
    goals: isPortuguese
      ? 'Acknowledge their worries with empathy, then ask about their financial goals. Explain you\'ll help track progress and celebrate wins together.'
      : 'Acknowledge their worries with empathy, then ask about their financial goals. Explain you\'ll help track progress and celebrate wins together.',
    
    risk: isPortuguese
      ? 'Acknowledge their goals, then ask about their investment risk tolerance. Explain this helps you give better investment advice. Give 3 clear options: conservative, moderate, aggressive.'
      : 'Acknowledge their goals, then ask about their investment risk tolerance. Explain this helps you give better investment advice. Give 3 clear options: conservative, moderate, aggressive.',
    
    complete: isPortuguese
      ? 'Summarize everything you learned about them in a warm, personalized way. Mention their comfort floor, key worries, goals, and risk profile. Express excitement to start helping them. End with "Vamos começar?"'
      : 'Summarize everything you learned about them in a warm, personalized way. Mention their comfort floor, key worries, goals, and risk profile. Express excitement to start helping them. End with "Ready to see your dashboard?"'
  }

  const userContext = step.previousAnswers
    ? `
Previous answers from user:
- Comfort Floor: ${step.previousAnswers.comfort_floor ? `€${step.previousAnswers.comfort_floor}` : 'not yet answered'}
- Worries: ${step.previousAnswers.worries?.join(', ') || 'not yet answered'}
- Goals: ${step.previousAnswers.goals?.join(', ') || 'not yet answered'}
- Risk Tolerance: ${step.previousAnswers.risk_tolerance || 'not yet answered'}
${step.userInput ? `\nUser just said: "${step.userInput}"` : ''}`
    : ''

  try {
    const messages = [
      { role: 'system' as const, content: ONBOARDING_SYSTEM_PROMPT },
      { 
        role: 'user' as const, 
        content: `${languageInstruction}

Current step: ${step.step}
${userContext}

Task: ${stepPrompts[step.step] || 'Continue the conversation naturally.'}` 
      }
    ]

    const response = await callOpenRouter(messages, undefined, 300, 0.7)

    return {
      success: true,
      message: response.trim()
    }
  } catch (error) {
    console.error('Onboarding AI error:', error)
    
    // Fallback messages in case AI fails
    const fallbacks: Record<string, string> = isPortuguese ? {
      welcome: 'Olá! 👋 Sou a Cora, a tua assistente financeira pessoal. Vou ajudar-te a entender e melhorar a tua saúde financeira. Mas primeiro, preciso conhecer-te melhor! Estás pronto(a) para começar?',
      comfort_floor: 'Qual é o teu Comfort Floor — o saldo mínimo que nunca queres ficar abaixo na tua conta? Assim posso avisar-te antes de gastares demais.',
      worries: 'Obrigada! Agora diz-me, quais são as tuas principais preocupações financeiras?',
      goals: 'Percebi! E quais são os teus objetivos financeiros?',
      risk: 'Última pergunta: Como te sentes em relação ao risco nos investimentos? Conservador, moderado ou agressivo?',
      complete: 'Está tudo! Aprendi muito sobre ti. Agora vou analisar as tuas finanças e dar-te insights personalizados. Vamos ver o teu dashboard?'
    } : {
      welcome: 'Hi! 👋 I\'m Cora, your personal finance assistant. I\'ll help you understand and improve your financial health. But first, I need to learn about you! Ready to start?',
      comfort_floor: 'What\'s your Comfort Floor — the minimum balance you never want to go below? This way I can warn you before you overspend.',
      worries: 'Thanks! Now tell me, what are your main financial worries?',
      goals: 'Got it! And what are your financial goals?',
      risk: 'Last question: How do you feel about investment risk? Conservative, moderate, or aggressive?',
      complete: 'All done! I learned a lot about you. Now I\'ll analyze your finances and give you personalized insights. Ready to see your dashboard?'
    }

    return {
      success: true, // Still return success with fallback
      message: fallbacks[step.step] || fallbacks.welcome
    }
  }
}
