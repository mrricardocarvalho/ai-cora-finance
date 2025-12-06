"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import CoraAvatar from '../../components/shared/cora-avatar'
import { Button } from '../../components/ui'
import { getSupabaseClient } from '../../lib/supabase/client'
import { generateOnboardingResponse } from '../../lib/actions/onboarding'

interface ChatMessage {
  id: number
  role: 'cora' | 'user'
  content: string
  timestamp: Date
}

interface OnboardingData {
  comfort_floor: number
  worries: string[]
  risk_tolerance: string
  goals: string[]
}

const WORRY_OPTIONS = [
  "Não estou a poupar o suficiente",
  "Muitas subscrições",
  "Despesas inesperadas",
  "Pagamentos de dívidas",
  "Planeamento para reforma",
  "Obrigações fiscais",
  "Decisões de investimento"
]

const GOAL_OPTIONS = [
  "Construir fundo de emergência",
  "Poupar para casa",
  "Investir para o futuro",
  "Pagar dívidas",
  "Reformar-me cedo (FIRE)",
  "Viajar mais",
  "Educação/formação"
]

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservador — Prefiro segurança" },
  { value: "moderate", label: "Moderado — Abordagem equilibrada" },
  { value: "aggressive", label: "Agressivo — Aceito volatilidade por mais retorno" }
]

type Step = 'welcome' | 'comfort_floor' | 'worries' | 'goals' | 'risk' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('welcome')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [useAI, setUseAI] = useState(true) // Story 6.10: AI-powered onboarding
  
  // Form data
  const [data, setData] = useState<OnboardingData>({
    comfort_floor: 500,
    worries: [],
    risk_tolerance: 'moderate',
    goals: []
  })
  const [inputValue, setInputValue] = useState('')

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Story 6.10: AI-generated welcome message
  const fetchAIMessage = async (stepName: Step, userInput?: string) => {
    if (!useAI) return null
    try {
      const response = await generateOnboardingResponse({
        step: stepName,
        userInput,
        previousAnswers: data
      }, 'pt-PT')
      return response.success ? response.message : null
    } catch {
      setUseAI(false) // Fallback to canned responses
      return null
    }
  }

  // Initial message with AI
  useEffect(() => {
    const initMessages = async () => {
      setIsTyping(true)
      const aiMessage = await fetchAIMessage('welcome')
      if (aiMessage) {
        setTimeout(() => {
          setMessages([{
            id: Date.now(),
            role: 'cora',
            content: aiMessage,
            timestamp: new Date()
          }])
          setIsTyping(false)
        }, 800)
      } else {
        // Fallback to original canned messages
        setTimeout(() => {
          addCoraMessageDirect("Olá! 👋 Sou a Cora, a tua assistente financeira pessoal.")
          setTimeout(() => {
            addCoraMessageDirect("Vou ajudar-te a entender e melhorar a tua saúde financeira. Mas primeiro, preciso conhecer-te melhor!")
            setTimeout(() => {
              addCoraMessageDirect("Estás pronto(a) para começar?")
              setIsTyping(false)
            }, 1500)
          }, 1500)
        }, 500)
      }
    }
    initMessages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Direct message add without typing simulation (for fallback)
  const addCoraMessageDirect = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      role: 'cora',
      content,
      timestamp: new Date()
    }])
  }

  const addCoraMessage = (content: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'cora',
        content,
        timestamp: new Date()
      }])
      setIsTyping(false)
    }, 800)
  }

  // Story 6.10: AI-powered step transition
  const transitionToStep = async (nextStep: Step, userInput?: string) => {
    setIsTyping(true)
    const aiMessage = await fetchAIMessage(nextStep, userInput)
    setTimeout(() => {
      if (aiMessage) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'cora',
          content: aiMessage,
          timestamp: new Date()
        }])
      }
      setStep(nextStep)
      setIsTyping(false)
    }, 800)
  }

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date()
    }])
  }

  const handleWelcomeResponse = async () => {
    addUserMessage("Sim, vamos lá!")
    if (useAI) {
      await transitionToStep('comfort_floor', "Sim, vamos lá!")
    } else {
      setTimeout(() => {
        addCoraMessage("Ótimo! 🎉 Primeira pergunta...")
        setTimeout(() => {
          addCoraMessage("Qual é o teu **Comfort Floor** — o saldo mínimo que nunca queres ficar abaixo na tua conta à ordem?")
          setStep('comfort_floor')
        }, 1500)
      }, 1000)
    }
  }

  const handleComfortFloorSubmit = async () => {
    const value = parseFloat(inputValue) || 500
    const updatedData = { ...data, comfort_floor: value }
    setData(updatedData)
    addUserMessage(`€${value.toLocaleString('pt-PT')}`)
    setInputValue('')
    
    if (useAI) {
      setIsTyping(true)
      const aiMessage = await fetchAIMessage('worries', `€${value}`)
      setTimeout(() => {
        if (aiMessage) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'cora',
            content: aiMessage,
            timestamp: new Date()
          }])
        }
        setStep('worries')
        setIsTyping(false)
      }, 800)
    } else {
      setTimeout(() => {
        addCoraMessage(`Percebi! Vou avisar-te quando estiveres perto dos €${value.toLocaleString('pt-PT')}.`)
        setTimeout(() => {
          addCoraMessage("Agora diz-me, quais são as tuas principais **preocupações financeiras**? Podes escolher várias.")
          setStep('worries')
        }, 1500)
      }, 1000)
    }
  }

  const handleWorriesSubmit = async () => {
    if (data.worries.length === 0) {
      addCoraMessage("Escolhe pelo menos uma preocupação, ou diz-me que não tens nenhuma!")
      return
    }
    addUserMessage(data.worries.join(", "))
    
    if (useAI) {
      setIsTyping(true)
      const aiMessage = await fetchAIMessage('goals', data.worries.join(", "))
      setTimeout(() => {
        if (aiMessage) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'cora',
            content: aiMessage,
            timestamp: new Date()
          }])
        }
        setStep('goals')
        setIsTyping(false)
      }, 800)
    } else {
      setTimeout(() => {
        addCoraMessage("Obrigada por partilhares! Vou ter isso em conta nas minhas análises. 📊")
        setTimeout(() => {
          addCoraMessage("E quais são os teus **objetivos financeiros**?")
          setStep('goals')
        }, 1500)
      }, 1000)
    }
  }

  const handleGoalsSubmit = async () => {
    if (data.goals.length === 0) {
      addCoraMessage("Escolhe pelo menos um objetivo!")
      return
    }
    addUserMessage(data.goals.join(", "))
    
    if (useAI) {
      setIsTyping(true)
      const aiMessage = await fetchAIMessage('risk', data.goals.join(", "))
      setTimeout(() => {
        if (aiMessage) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'cora',
            content: aiMessage,
            timestamp: new Date()
          }])
        }
        setStep('risk')
        setIsTyping(false)
      }, 800)
    } else {
      setTimeout(() => {
        addCoraMessage("Excelente! Vou ajudar-te a alcançar esses objetivos. 🎯")
        setTimeout(() => {
          addCoraMessage("Última pergunta: Como te sentes em relação ao **risco nos investimentos**?")
          setStep('risk')
        }, 1500)
      }, 1000)
    }
  }

  const handleRiskSelect = async (value: string) => {
    const label = RISK_OPTIONS.find(o => o.value === value)?.label || value
    const updatedData = { ...data, risk_tolerance: value }
    setData(updatedData)
    addUserMessage(label)
    
    if (useAI) {
      setIsTyping(true)
      // Pass all data for final summary
      const aiMessage = await generateOnboardingResponse({
        step: 'complete',
        userInput: label,
        previousAnswers: updatedData
      }, 'pt-PT')
      setTimeout(() => {
        if (aiMessage.success) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'cora',
            content: aiMessage.message,
            timestamp: new Date()
          }])
        }
        setStep('complete')
        setIsTyping(false)
      }, 800)
    } else {
      setTimeout(() => {
        const emoji = value === 'conservative' ? '🛡️' : value === 'aggressive' ? '🚀' : '⚖️'
        addCoraMessage(`${emoji} Entendido! Vou adaptar as minhas recomendações ao teu perfil.`)
        setTimeout(() => {
          addCoraMessage("Está tudo! Aprendi muito sobre ti. Agora vou analisar as tuas finanças e dar-te insights personalizados.")
          setTimeout(() => {
            addCoraMessage("Pronto(a) para ver o teu dashboard? 🏠")
            setStep('complete')
          }, 1500)
        }, 1500)
      }, 1000)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    const client = getSupabaseClient()
    if (!client) {
      router.push('/')
      return
    }

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await client
      .from('profiles')
      .upsert({
        id: user.id,
        comfort_floor: data.comfort_floor,
        risk_tolerance: data.risk_tolerance,
        goals: data.goals,
        worries: data.worries,
        onboarding_completed: true,
        onboarding_step: 5
      })

    if (error) {
      console.error('Failed to save onboarding:', error)
    }

    router.push('/')
  }

  const toggleOption = (option: string, field: 'worries' | 'goals') => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(option)
        ? prev[field].filter(o => o !== option)
        : [...prev[field], option]
    }))
  }

  const progress = {
    welcome: 0,
    comfort_floor: 25,
    worries: 50,
    goals: 75,
    risk: 90,
    complete: 100
  }[step]

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[var(--border-glass)]">
        <motion.div 
          className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-lg mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'cora' && (
                  <CoraAvatar state="idle" size={36} />
                )}
                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-[var(--primary-glass)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-sm font-medium">
                    Tu
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    msg.role === 'cora'
                      ? 'bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-tl-sm shadow-[var(--shadow-glass)]'
                      : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-tr-sm shadow-[var(--shadow-glass)]'
                  }`}
                >
                  <p className="text-sm" dangerouslySetInnerHTML={{ 
                    __html: msg.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') 
                  }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <CoraAvatar state="thinking" size={36} />
              <div className="bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-[var(--shadow-glass)]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface-glass)] backdrop-blur-xl border-t border-[var(--border-glass)] p-4">
        <div className="max-w-lg mx-auto">
          {step === 'welcome' && (
            <Button variant="primary" onClick={handleWelcomeResponse} className="w-full">
              Sim, vamos lá! 🚀
            </Button>
          )}

          {step === 'comfort_floor' && (
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-[var(--border-glass)] rounded-full bg-[var(--surface-glass)] backdrop-blur-sm">
                <span className="text-[var(--text-muted)]">€</span>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="500"
                  className="flex-1 outline-none text-lg bg-transparent text-[var(--text-on-glass)] placeholder:text-[var(--text-muted)]"
                  autoFocus
                />
              </div>
              <Button variant="primary" onClick={handleComfortFloorSubmit}>
                Enviar
              </Button>
            </div>
          )}

          {step === 'worries' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {WORRY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleOption(option, 'worries')}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-300 ${
                      data.worries.includes(option)
                        ? 'border-[var(--primary)] bg-[var(--primary-glass)] text-[var(--primary)]'
                        : 'border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface-glass)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <Button variant="primary" onClick={handleWorriesSubmit} className="w-full">
                Continuar
              </Button>
            </div>
          )}

          {step === 'goals' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleOption(option, 'goals')}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-300 ${
                      data.goals.includes(option)
                        ? 'border-[var(--primary)] bg-[var(--primary-glass)] text-[var(--primary)]'
                        : 'border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface-glass)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <Button variant="primary" onClick={handleGoalsSubmit} className="w-full">
                Continuar
              </Button>
            </div>
          )}

          {step === 'risk' && (
            <div className="space-y-2">
              {RISK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRiskSelect(option.value)}
                  className="w-full p-4 text-left rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-glass)] backdrop-blur-sm text-[var(--text-on-glass)] hover:border-[var(--primary)] hover:bg-[var(--primary-glass)] transition-all duration-300"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {step === 'complete' && (
            <Button 
              variant="primary" 
              onClick={handleComplete} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'A preparar...' : 'Ver Dashboard 🏠'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
