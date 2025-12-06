'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function transcribeAudio(formData: FormData) {
  const file = formData.get('file') as File
  
  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  try {
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      // We don't specify language to allow auto-detection, 
      // or we could pass it from the client if needed.
    })

    return { success: true, text: response.text }
  } catch (error) {
    console.error('Transcription error:', error)
    return { success: false, error: 'Transcription failed' }
  }
}
