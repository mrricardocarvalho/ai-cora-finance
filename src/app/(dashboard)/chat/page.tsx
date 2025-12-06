import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import ChatInterface from '../../../components/chat/ChatInterface'
import { getOrCreatePrimaryConversation, getMessages, getCoraGreeting } from '../../../lib/actions/chat'

// Metadata for the page
export const metadata = {
  title: 'Cora - A tua assistente financeira',
  description: 'Conversa com a Cora sobre as tuas finanças'
}

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get or create the user's primary conversation (single continuous chat)
  const conversationResult = await getOrCreatePrimaryConversation(user.id)
  const conversation = conversationResult.success && conversationResult.data ? conversationResult.data : null
  
  // Load messages for this conversation
  let messages: Array<{ id: string; conversation_id: string; role: 'user' | 'assistant'; content: string; suggested_questions?: string[]; created_at: string }> = []
  
  if (conversation) {
    const messagesResult = await getMessages(conversation.id)
    if (messagesResult.success && messagesResult.data) {
      messages = messagesResult.data
    }
  }
  
  // Get Cora's proactive greeting with insights
  const greetingResult = await getCoraGreeting(user.id)
  const coraGreeting = greetingResult.success && greetingResult.data ? greetingResult.data : null
  
  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <ChatInterface 
        userId={user.id} 
        initialConversation={conversation}
        initialMessages={messages}
        proactiveGreeting={coraGreeting}
      />
    </div>
  )
}
