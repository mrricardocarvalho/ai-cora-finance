# Story 12.5: Voice Accessibility & Settings

**Status:** Approved
**Epic:** [Epic 12 - Voice Interface](../epics/epic-12-voice-interface.md)
**Priority:** Medium
**Points:** 3

---

## User Story

**As a** User,
**I want** to customize voice settings to my preferences,
**So that** the experience matches my needs.

---

## Acceptance Criteria

### AC #1: Voice Settings Page
- **Given** user navigates to Settings
- **When** accessing Voice/Accessibility section
- **Then** show options:
  - Voice responses: On/Off
  - Voice speed: Slow/Normal/Fast
  - Voice selection (if multiple available)
  - Auto-listen after response: On/Off
  - Confirmation before sending: On/Off

### AC #2: Accessibility Integration
- **Given** user has screen reader enabled
- **When** voice features are used
- **Then** ensure compatibility:
  - Don't conflict with screen reader
  - Provide ARIA labels for voice controls
  - Option to disable voice in favor of screen reader

### AC #3: Keyboard Shortcuts
- **Given** user prefers keyboard
- **When** in chat
- **Then** support:
  - `V` or `Space` to toggle voice input
  - `Esc` to stop listening/speaking
  - `P` to pause/resume speech

### AC #4: Data Privacy Disclosure
- **Given** voice processing may use cloud services
- **When** user enables voice features
- **Then** show disclosure: "Voice is processed to understand your questions. Audio is not stored permanently."

### AC #5: Offline Handling
- **Given** user is offline
- **When** voice feature is attempted
- **Then** show message: "Voice features require an internet connection."

---

## Technical Notes

- Create dedicated voice settings section
- Store preferences in profile
- Respect system accessibility settings

### Voice Preferences Schema
```typescript
interface VoicePreferences {
  enabled: boolean;
  speed: 'slow' | 'normal' | 'fast'; // 0.75, 1.0, 1.25
  autoListenAfterResponse: boolean;
  confirmBeforeSending: boolean;
  preferredVoiceId?: string;
}
```

### Speed Values
```typescript
const speedValues = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25,
};
```

### Keyboard Shortcut Setup
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return; // Don't interfere with typing
    
    switch (e.key.toLowerCase()) {
      case 'v':
      case ' ':
        toggleVoiceInput();
        break;
      case 'escape':
        stopListeningOrSpeaking();
        break;
      case 'p':
        togglePause();
        break;
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Accessibility Checks
```typescript
function checkAccessibility(): AccessibilityContext {
  return {
    screenReaderActive: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    systemVoiceOverEnabled: 'speechSynthesis' in window,
  };
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/settings/voice/page.tsx` | Create |
| `src/components/settings/VoiceSettings.tsx` | Create |
| `src/lib/voice/preferences.ts` | Create |
| `db/migrations/00XX_add_voice_preferences.sql` | Create |

---

## Prerequisites

- Story 12.1: Speech-to-Text Integration
- Story 12.2: Text-to-Speech Responses

---

## Definition of Done

- [ ] Voice settings page accessible
- [ ] All preference options work
- [ ] Keyboard shortcuts functional
- [ ] Screen reader compatibility
- [ ] Privacy disclosure shown
- [ ] Offline handling works
- [ ] Preferences persist in profile
- [ ] ARIA labels on all voice controls
