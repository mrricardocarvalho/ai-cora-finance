# Story 12.4: Conversational Voice Mode

**Status:** Approved
**Epic:** [Epic 12 - Voice Interface](../epics/epic-12-voice-interface.md)
**Priority:** Medium
**Points:** 8

---

## User Story

**As a** User,
**I want** to have a full hands-free conversation with Cora,
**So that** I can manage my finances while doing other activities.

---

## Acceptance Criteria

### AC #1: Continuous Listening Mode
- **Given** user activates "Jarvis Mode"
- **When** enabled
- **Then**:
  - Microphone stays active between exchanges
  - Cora auto-listens after responding
  - User can speak naturally without tapping buttons

### AC #2: Wake Word (Stretch)
- **Given** Jarvis Mode is active
- **When** Cora is not actively listening
- **Then** listen for wake word: "Hey Cora" or "Okay Cora"

### AC #3: Conversation Flow
- **Given** a voice conversation
- **When** Cora and user exchange
- **Then** maintain natural flow:
  - Cora speaks response
  - Brief pause (1 second)
  - Microphone activates for user response
  - Timeout after 10 seconds of silence

### AC #4: Interrupt Handling
- **Given** Cora is speaking
- **When** user starts talking
- **Then** stop Cora's speech and process new input

### AC #5: Exit Commands
- **Given** user wants to end voice mode
- **When** they say "Stop listening" or "Exit Jarvis mode"
- **Then** deactivate continuous listening

### AC #6: Visual State Indicator
- **Given** voice mode is active
- **When** displaying
- **Then** show clear state indicators:
  - 🎤 "Listening..." (user's turn)
  - 🔊 "Speaking..." (Cora's turn)
  - ⏸️ "Paused" (ready for wake word)

### AC #7: Mobile Lock Screen (Stretch)
- **Given** user is using PWA on mobile
- **When** voice mode is active
- **Then** attempt to keep screen/audio active (within browser limitations)

---

## Technical Notes

- Implement state machine for conversation flow
- Consider battery/performance impact of continuous listening
- Wake word detection is complex - may require cloud service

### Conversation State Machine
```typescript
type VoiceState = 
  | 'idle'           // Not in voice mode
  | 'listening'      // Waiting for user input
  | 'processing'     // Transcribing/thinking
  | 'speaking'       // Cora is responding
  | 'paused';        // Waiting for wake word

interface VoiceSession {
  state: VoiceState;
  conversationHistory: Message[];
  startTime: Date;
  interactionCount: number;
}

function transition(current: VoiceState, event: VoiceEvent): VoiceState {
  switch (current) {
    case 'idle':
      if (event === 'activate') return 'listening';
      break;
    case 'listening':
      if (event === 'speech_detected') return 'processing';
      if (event === 'timeout') return 'paused';
      if (event === 'exit_command') return 'idle';
      break;
    case 'processing':
      if (event === 'response_ready') return 'speaking';
      break;
    case 'speaking':
      if (event === 'finished_speaking') return 'listening';
      if (event === 'interrupted') return 'listening';
      break;
    case 'paused':
      if (event === 'wake_word') return 'listening';
      if (event === 'exit') return 'idle';
      break;
  }
  return current;
}
```

### UI Overlay
```
┌──────────────────────────────────────┐
│         🎤 Jarvis Mode Active        │
│                                      │
│         [Animated Waveform]          │
│                                      │
│         "Listening..."               │
│                                      │
│   Say "Stop listening" to exit       │
│                                      │
│         [Exit Button]                │
└──────────────────────────────────────┘
```

### Wake Word Detection Options
1. **On-device (Porcupine)**: Requires WASM, privacy-friendly
2. **Cloud-based**: Always-on microphone streaming, privacy concerns
3. **Button-activated**: User presses to start each interaction (simplest)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/voice/conversation-mode.ts` | Create |
| `src/components/chat/JarvisModeOverlay.tsx` | Create |
| `src/components/chat/VoiceStateIndicator.tsx` | Create |
| `src/app/(dashboard)/chat/page.tsx` | Modify (integrate) |

---

## Prerequisites

- Story 12.1: Speech-to-Text Integration
- Story 12.2: Text-to-Speech Responses
- Story 12.3: Voice-First Quick Commands

---

## Definition of Done

- [ ] Jarvis Mode activates/deactivates cleanly
- [ ] Continuous conversation without tapping
- [ ] State transitions work correctly
- [ ] Interrupt handling works
- [ ] Exit commands recognized
- [ ] Visual state indicators visible
- [ ] Timeout after 10s silence
- [ ] Battery impact acceptable
