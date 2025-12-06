"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Mic, MicOff, Loader2, Command } from 'lucide-react'
import { SpeechRecognitionService } from '@/lib/voice/speech-to-text'
import { processVoiceCommand } from '@/lib/voice/command-processor'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionService | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    recognitionRef.current = new SpeechRecognitionService({
      lang: 'en-US', // Or pt-PT based on user pref
      continuous: false,
      interimResults: true,
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: (err) => {
        console.error(err)
        setIsListening(false)
        toast({ title: "Voice Error", description: "Could not understand audio.", variant: "destructive" })
      },
      onResult: (text, isFinal) => {
        setTranscript(text)
        if (isFinal) {
          handleCommand(text)
        }
      }
    })

    return () => {
      recognitionRef.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      setTranscript('')
      recognitionRef.current?.start()
    }
  }

  const handleCommand = async (text: string) => {
    setProcessing(true)
    recognitionRef.current?.stop()
    
    // Simulate small delay for "thinking"
    await new Promise(resolve => setTimeout(resolve, 500))

    const action = processVoiceCommand(text)
    
    switch (action.type) {
      case 'NAVIGATE':
        setIsOpen(false)
        router.push(action.path)
        toast({ title: "Navigating", description: `Going to ${action.path}` })
        break
      case 'ADD_TRANSACTION':
        // In a real app, we'd call an API or open a pre-filled form
        setIsOpen(false)
        toast({ 
          title: "Transaction Recognized", 
          description: `${action.amount > 0 ? 'Income' : 'Expense'}: ${Math.abs(action.amount)} for ${action.description}` 
        })
        // Ideally redirect to transaction form with query params
        break
      case 'UNKNOWN':
        toast({ title: "Unknown Command", description: "I didn't catch that. Try 'Go to dashboard' or 'Spent 50 on food'.", variant: "destructive" })
        break
    }
    setProcessing(false)
  }

  if (!recognitionRef.current?.getIsSupported()) {
    return null // Don't render if not supported
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
      >
        <Mic className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Voice Assistant
            </DialogTitle>
            <DialogDescription>
              Try saying &quot;Go to Portfolio&quot; or &quot;Spent 20 on Coffee&quot;
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className={cn(
              "relative flex items-center justify-center h-24 w-24 rounded-full transition-all duration-300",
              isListening ? "bg-red-100 animate-pulse" : "bg-muted"
            )}>
              <Button 
                variant={isListening ? "danger" : "secondary"} 
                size="icon" 
                className="h-16 w-16 rounded-full"
                onClick={toggleListening}
                disabled={processing}
              >
                {processing ? <Loader2 className="h-8 w-8 animate-spin" /> : isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
            </div>

            <div className="text-center min-h-[3rem]">
              {processing ? (
                <p className="text-sm text-muted-foreground animate-pulse">Processing...</p>
              ) : transcript ? (
                <p className="text-lg font-medium text-foreground">&quot;{transcript}&quot;</p>
              ) : (
                <p className="text-sm text-muted-foreground">Tap microphone to speak</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
