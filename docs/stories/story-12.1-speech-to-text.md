# Story 12.1: Speech-to-Text Integration

**Epic:** [Epic 12 - Voice Interface](../epics/epic-12-voice-interface.md)
**Priority:** High
**Points:** 5
**Status:** Completed

---

## User Story

**As a** User,
**I want** to speak my questions to Cora instead of typing,
**So that** I can interact hands-free.

---

## Acceptance Criteria

### AC #1: Microphone Button
- **Given** the chat interface
- **When** viewing the input area
- **Then** show a microphone button next to the text input

### AC #2: Permission Handling
- **Given** user taps the microphone button
- **When** browser permission is not granted
- **Then** request microphone permission with clear explanation: "Cora needs microphone access to hear your questions"

### AC #3: Speech Recognition
- **Given** microphone is active
- **When** user speaks
- **Then** convert speech to text in real-time using Web Speech API (or Whisper API fallback)

### AC #4: Visual Feedback
- **Given** microphone is listening
- **When** active
- **Then** show:
  - Pulsing microphone animation
  - Audio level indicator (waveform)
  - Transcription appearing in real-time in input field

### AC #5: Language Support
- **Given** the app supports PT-PT and EN-US
- **When** user speaks
- **Then** recognize both Portuguese and English based on user's language setting

### AC #6: End Detection
- **Given** user stops speaking
- **When** silence is detected for 2 seconds
- **Then** automatically submit the transcribed text (or wait for confirmation)

### AC #7: Error Handling
- **Given** speech recognition fails
- **When** error occurs
- **Then** show helpful message: "I didn't catch that. Try again or type your question."

---

## Tasks/Subtasks

- [x] Create `src/lib/voice/speech-to-text.ts` (Web Speech API wrapper) <!-- id: 1 -->
- [x] Create `src/components/chat/AudioWaveform.tsx` (Visual feedback) <!-- id: 2 -->
- [x] Create `src/components/chat/VoiceInput.tsx` (Microphone button and logic) <!-- id: 3 -->
- [x] Integrate `VoiceInput` into `src/app/(dashboard)/chat/page.tsx` <!-- id: 4 -->
- [x] Implement Whisper API fallback logic (server-side route) <!-- id: 5 -->

---

## Technical Notes

- Use Web Speech API (`webkitSpeechRecognition`) for browser-native solution
- Fallback to OpenAI Whisper API for better accuracy (costs money)
- Consider audio preprocessing for noise reduction
- Store user preference for auto-submit vs manual confirmation

### Web Speech API Usage
```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function createSpeechRecognizer(locale: 'pt-PT' | 'en-US') {
  const recognition = new SpeechRecognition();
  recognition.lang = locale;
  recognition.continuous = false;
  recognition.interimResults = true;
  
  return recognition;
}
```

### Browser Support
| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Edge | ✅ Full |
| Safari | ⚠️ Limited |
| Firefox | ❌ No |

### Fallback Strategy
```typescript
async function transcribeWithWhisper(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', currentLocale);
  
  const response = await fetch('/api/voice/transcribe', {
    method: 'POST',
    body: formData,
  });
  return response.json().text;
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/voice/speech-to-text.ts` | Create |
| `src/components/chat/VoiceInput.tsx` | Create |
| `src/components/chat/AudioWaveform.tsx` | Create |
| `src/app/(dashboard)/chat/page.tsx` | Modify (integrate button) |

---

## Prerequisites

- Working chat interface

---

## Definition of Done

- [ ] Microphone button visible in chat
- [ ] Permission request with explanation
- [ ] Speech recognition works in Chrome/Edge
- [ ] Visual feedback while listening
- [ ] PT-PT and EN-US recognition
- [ ] Auto-end detection after silence
- [ ] Error handling with helpful messages
- [ ] Fallback to Whisper API for unsupported browsers
