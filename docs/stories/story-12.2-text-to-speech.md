# Story 12.2: Text-to-Speech Responses

**Status:** Approved
**Epic:** [Epic 12 - Voice Interface](../epics/epic-12-voice-interface.md)
**Priority:** High
**Points:** 5

---

## User Story

**As a** User,
**I want** Cora to speak her responses aloud,
**So that** I can listen without looking at the screen.

---

## Acceptance Criteria

### AC #1: Voice Response Toggle
- **Given** the chat interface
- **When** viewing settings or chat header
- **Then** show toggle: "🔊 Voice Responses" (on/off)

### AC #2: Spoken Response
- **Given** voice responses are enabled
- **When** Cora responds to a message
- **Then** read the response aloud using Web Speech Synthesis API

### AC #3: Voice Selection
- **Given** the app supports multiple languages
- **When** user's locale is pt-PT
- **Then** use a Portuguese voice (female, natural-sounding)
- **When** user's locale is en-US
- **Then** use an English voice

### AC #4: Cora Persona Voice
- **Given** Cora has a personality
- **When** selecting voice
- **Then** prefer voices that are:
  - Female (matching Cora's persona)
  - Warm and professional tone
  - Natural pacing (not robotic)

### AC #5: Playback Controls
- **Given** response is being read
- **When** user wants to control playback
- **Then** provide:
  - Pause/Resume button
  - Stop button
  - Speed control (0.75x, 1x, 1.25x, 1.5x)

### AC #6: Smart Reading
- **Given** response contains data (numbers, lists)
- **When** reading aloud
- **Then** adapt:
  - Read numbers naturally ("one thousand two hundred" not "one two zero zero")
  - Read currency properly ("mil e duzentos euros")
  - Pause appropriately for lists

### AC #7: Avoid Reading UI Elements
- **Given** response includes charts or buttons
- **When** reading aloud
- **Then** skip non-text content and summarize: "I've prepared a chart showing your spending trends."

---

## Technical Notes

- Use Web Speech Synthesis API (`speechSynthesis`)
- Create text preprocessing for natural reading
- Consider ElevenLabs or AWS Polly for higher quality (premium feature)
- Store voice preferences in profile

### Web Speech Synthesis Usage
```typescript
function speak(text: string, locale: 'pt-PT' | 'en-US', rate: number = 1) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = rate;
  
  // Find best voice for locale
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.lang.startsWith(locale.split('-')[0]) && v.name.toLowerCase().includes('female')
  );
  if (preferredVoice) utterance.voice = preferredVoice;
  
  speechSynthesis.speak(utterance);
}
```

### Text Preprocessing
```typescript
function preprocessForSpeech(text: string, locale: string): string {
  // Convert currency
  text = text.replace(/€(\d+)/g, (_, n) => 
    locale === 'pt-PT' ? `${n} euros` : `${n} euros`
  );
  
  // Convert percentages
  text = text.replace(/(\d+)%/g, '$1 percent');
  
  // Handle lists
  text = text.replace(/•/g, '... ');
  
  // Remove markdown
  text = text.replace(/\*\*/g, '');
  
  return text;
}
```

### Voice Quality Hierarchy
1. ElevenLabs (premium, best quality)
2. Google Cloud TTS (good quality, PT-PT support)
3. AWS Polly (good quality)
4. Web Speech Synthesis (free, variable quality)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/voice/text-to-speech.ts` | Create |
| `src/components/chat/VoiceResponse.tsx` | Create |
| `src/components/chat/VoiceSettings.tsx` | Create |
| `src/lib/voice/text-preprocessing.ts` | Create |

---

## Prerequisites

- Working chat interface with responses

---

## Definition of Done

- [ ] Voice toggle in chat settings
- [ ] Responses read aloud when enabled
- [ ] Portuguese and English voices work
- [ ] Playback controls (pause/stop/speed)
- [ ] Numbers and currency read naturally
- [ ] UI elements skipped/summarized
- [ ] Voice preference persisted
