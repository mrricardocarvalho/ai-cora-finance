# Epic 12: Voice Interface ("Jarvis Mode")

**Goal:** Enable hands-free interaction with Cora through voice commands and spoken responses, making financial management accessible during daily activities.

**Prerequisites:** Epic 3 (Chat/Insights), All core features working.

**Business Value:** Users can check their finances while cooking, driving, or exercising. Voice creates an emotional connection with Cora as a true financial assistant, not just an app.

---

## Stories

### Story 12.1: Speech-to-Text Integration

**As a** User,
**I want** to speak my questions to Cora instead of typing,
**So that** I can interact hands-free.

**Acceptance Criteria:**

**AC #1: Microphone Button**
- **Given** the chat interface
- **When** viewing the input area
- **Then** show a microphone button next to the text input

**AC #2: Permission Handling**
- **Given** user taps the microphone button
- **When** browser permission is not granted
- **Then** request microphone permission with clear explanation: "Cora needs microphone access to hear your questions"

**AC #3: Speech Recognition**
- **Given** microphone is active
- **When** user speaks
- **Then** convert speech to text in real-time using Web Speech API (or Whisper API fallback)

**AC #4: Visual Feedback**
- **Given** microphone is listening
- **When** active
- **Then** show:
  - Pulsing microphone animation
  - Audio level indicator (waveform)
  - Transcription appearing in real-time in input field

**AC #5: Language Support**
- **Given** the app supports PT-PT and EN-US
- **When** user speaks
- **Then** recognize both Portuguese and English based on user's language setting

**AC #6: End Detection**
- **Given** user stops speaking
- **When** silence is detected for 2 seconds
- **Then** automatically submit the transcribed text (or wait for confirmation)

**AC #7: Error Handling**
- **Given** speech recognition fails
- **When** error occurs
- **Then** show helpful message: "I didn't catch that. Try again or type your question."

**Technical Notes:**
- Use Web Speech API (`webkitSpeechRecognition`) for browser-native solution
- Fallback to OpenAI Whisper API for better accuracy (costs money)
- Consider audio preprocessing for noise reduction
- Store user preference for auto-submit vs manual confirmation

**Files to Create/Modify:**
- `src/lib/voice/speech-to-text.ts` (new)
- `src/components/chat/VoiceInput.tsx` (new)
- `src/components/chat/AudioWaveform.tsx` (new)
- `src/app/(dashboard)/chat/page.tsx` (integrate voice button)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 12.2: Text-to-Speech Responses

**As a** User,
**I want** Cora to speak her responses aloud,
**So that** I can listen without looking at the screen.

**Acceptance Criteria:**

**AC #1: Voice Response Toggle**
- **Given** the chat interface
- **When** viewing settings or chat header
- **Then** show toggle: "🔊 Voice Responses" (on/off)

**AC #2: Spoken Response**
- **Given** voice responses are enabled
- **When** Cora responds to a message
- **Then** read the response aloud using Web Speech Synthesis API

**AC #3: Voice Selection**
- **Given** the app supports multiple languages
- **When** user's locale is pt-PT
- **Then** use a Portuguese voice (female, natural-sounding)
- **When** user's locale is en-US
- **Then** use an English voice

**AC #4: Cora Persona Voice**
- **Given** Cora has a personality
- **When** selecting voice
- **Then** prefer voices that are:
  - Female (matching Cora's persona)
  - Warm and professional tone
  - Natural pacing (not robotic)

**AC #5: Playback Controls**
- **Given** response is being read
- **When** user wants to control playback
- **Then** provide:
  - Pause/Resume button
  - Stop button
  - Speed control (0.75x, 1x, 1.25x, 1.5x)

**AC #6: Smart Reading**
- **Given** response contains data (numbers, lists)
- **When** reading aloud
- **Then** adapt:
  - Read numbers naturally ("one thousand two hundred" not "one two zero zero")
  - Read currency properly ("mil e duzentos euros")
  - Pause appropriately for lists

**AC #7: Avoid Reading UI Elements**
- **Given** response includes charts or buttons
- **When** reading aloud
- **Then** skip non-text content and summarize: "I've prepared a chart showing your spending trends."

**Technical Notes:**
- Use Web Speech Synthesis API (`speechSynthesis`)
- Create text preprocessing for natural reading
- Consider ElevenLabs or AWS Polly for higher quality (premium feature)
- Store voice preferences in profile

**Files to Create/Modify:**
- `src/lib/voice/text-to-speech.ts` (new)
- `src/components/chat/VoiceResponse.tsx` (new)
- `src/components/chat/VoiceSettings.tsx` (new)
- `src/lib/voice/text-preprocessing.ts` (new - format numbers, currency)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 12.3: Voice-First Quick Commands

**As a** User,
**I want** to give Cora quick voice commands for common actions,
**So that** I can get answers instantly without full conversations.

**Acceptance Criteria:**

**AC #1: Command Recognition**
- **Given** user activates voice input
- **When** they say a quick command
- **Then** recognize and execute:
  - "What's my balance?" → Current account balance
  - "Safe to spend?" → Safe-to-Spend amount
  - "How much did I spend on groceries?" → Category spend
  - "Any alerts?" → Read pending insights
  - "What bills are coming up?" → Upcoming recurring expenses

**AC #2: Natural Language Variations**
- **Given** users speak naturally
- **When** processing commands
- **Then** understand variations:
  - "How much can I spend?" = "Safe to spend?"
  - "What's my net worth?" = "Total balance?"
  - "Read my insights" = "Any alerts?"

**AC #3: Context-Aware Responses**
- **Given** a quick command is recognized
- **When** responding
- **Then** provide concise spoken response:
  - "Your safe to spend is €847. You have €1,200 after bills, minus your €350 comfort floor."

**AC #4: Follow-Up Handling**
- **Given** user asks a quick question
- **When** Cora responds
- **Then** listen for follow-up:
  - User: "What's my balance?"
  - Cora: "Your total balance is €5,432 across 3 accounts."
  - User: "Break it down"
  - Cora: "Moey checking: €2,100. Savings: €3,000. ActivoBank: €332."

**AC #5: Command Suggestions**
- **Given** user taps microphone for first time
- **When** showing listening state
- **Then** display suggested commands: "Try saying: 'What's my balance?' or 'Any alerts?'"

**Technical Notes:**
- Create intent classification for quick commands
- Map intents to existing API endpoints
- Use conversation context for follow-ups

**Files to Create/Modify:**
- `src/lib/voice/command-recognition.ts` (new)
- `src/lib/voice/quick-commands.ts` (new - command definitions)
- `src/components/chat/VoiceCommandSuggestions.tsx` (new)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 12.4: Conversational Voice Mode

**As a** User,
**I want** to have a full hands-free conversation with Cora,
**So that** I can manage my finances while doing other activities.

**Acceptance Criteria:**

**AC #1: Continuous Listening Mode**
- **Given** user activates "Jarvis Mode"
- **When** enabled
- **Then**:
  - Microphone stays active between exchanges
  - Cora auto-listens after responding
  - User can speak naturally without tapping buttons

**AC #2: Wake Word (Stretch)**
- **Given** Jarvis Mode is active
- **When** Cora is not actively listening
- **Then** listen for wake word: "Hey Cora" or "Okay Cora"

**AC #3: Conversation Flow**
- **Given** a voice conversation
- **When** Cora and user exchange
- **Then** maintain natural flow:
  - Cora speaks response
  - Brief pause (1 second)
  - Microphone activates for user response
  - Timeout after 10 seconds of silence

**AC #4: Interrupt Handling**
- **Given** Cora is speaking
- **When** user starts talking
- **Then** stop Cora's speech and process new input

**AC #5: Exit Commands**
- **Given** user wants to end voice mode
- **When** they say "Stop listening" or "Exit Jarvis mode"
- **Then** deactivate continuous listening

**AC #6: Visual State Indicator**
- **Given** voice mode is active
- **When** displaying
- **Then** show clear state indicators:
  - 🎤 "Listening..." (user's turn)
  - 🔊 "Speaking..." (Cora's turn)
  - ⏸️ "Paused" (ready for wake word)

**AC #7: Mobile Lock Screen (Stretch)**
- **Given** user is using PWA on mobile
- **When** voice mode is active
- **Then** attempt to keep screen/audio active (within browser limitations)

**Technical Notes:**
- Implement state machine for conversation flow
- Consider battery/performance impact of continuous listening
- Wake word detection is complex - may require cloud service

**Files to Create/Modify:**
- `src/lib/voice/conversation-mode.ts` (new)
- `src/components/chat/JarvisModeOverlay.tsx` (new)
- `src/components/chat/VoiceStateIndicator.tsx` (new)
- `src/app/(dashboard)/chat/page.tsx` (integrate Jarvis mode)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 12.5: Voice Accessibility & Settings

**As a** User,
**I want** to customize voice settings to my preferences,
**So that** the experience matches my needs.

**Acceptance Criteria:**

**AC #1: Voice Settings Page**
- **Given** user navigates to Settings
- **When** accessing Voice/Accessibility section
- **Then** show options:
  - Voice responses: On/Off
  - Voice speed: Slow/Normal/Fast
  - Voice selection (if multiple available)
  - Auto-listen after response: On/Off
  - Confirmation before sending: On/Off

**AC #2: Accessibility Integration**
- **Given** user has screen reader enabled
- **When** voice features are used
- **Then** ensure compatibility:
  - Don't conflict with screen reader
  - Provide ARIA labels for voice controls
  - Option to disable voice in favor of screen reader

**AC #3: Keyboard Shortcuts**
- **Given** user prefers keyboard
- **When** in chat
- **Then** support:
  - `V` or `Space` to toggle voice input
  - `Esc` to stop listening/speaking
  - `P` to pause/resume speech

**AC #4: Data Privacy Disclosure**
- **Given** voice processing may use cloud services
- **When** user enables voice features
- **Then** show disclosure: "Voice is processed to understand your questions. Audio is not stored permanently."

**AC #5: Offline Handling**
- **Given** user is offline
- **When** voice feature is attempted
- **Then** show message: "Voice features require an internet connection."

**Technical Notes:**
- Create dedicated voice settings section
- Store preferences in profile
- Respect system accessibility settings

**Files to Create/Modify:**
- `src/app/settings/voice/page.tsx` (new)
- `src/components/settings/VoiceSettings.tsx` (new)
- `src/lib/voice/preferences.ts` (new)
- `db/migrations/00XX_add_voice_preferences.sql` (new)

**Estimated Effort:** 3 points (1 day)

---

## Epic Summary

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| 12.1 | Speech-to-Text Integration | 5 | High |
| 12.2 | Text-to-Speech Responses | 5 | High |
| 12.3 | Voice-First Quick Commands | 5 | Medium |
| 12.4 | Conversational Voice Mode | 8 | Medium |
| 12.5 | Voice Accessibility & Settings | 3 | Medium |

**Total Points:** 26
**Estimated Timeline:** 2 weeks

---

## Success Metrics

- [ ] 20% of chat interactions initiated by voice
- [ ] Voice users have higher engagement (more sessions/week)
- [ ] User satisfaction with voice quality > 4/5
- [ ] Accessibility compliance maintained

---

## Technical Considerations

### Web Speech API Browser Support
| Browser | Speech Recognition | Speech Synthesis |
|---------|-------------------|------------------|
| Chrome | ✅ Full | ✅ Full |
| Edge | ✅ Full | ✅ Full |
| Safari | ⚠️ Limited | ✅ Full |
| Firefox | ❌ No | ✅ Full |

**Fallback Strategy:**
- Speech Recognition: OpenAI Whisper API for unsupported browsers
- Speech Synthesis: Native API has wide support, premium voices via ElevenLabs

### Portuguese Voice Quality
- Web Speech Synthesis has limited PT-PT voices
- Consider cloud TTS for better quality:
  - Google Cloud Text-to-Speech (PT-PT voices)
  - AWS Polly (Camila voice for PT-BR, adaptable)
  - ElevenLabs (custom voice cloning)

### Privacy Considerations
- Audio processing should be ephemeral
- Clearly disclose cloud processing
- Offer on-device processing where possible
- Comply with GDPR for voice data
