# Story 12.3: Voice-First Quick Commands

**Status:** Approved
**Epic:** [Epic 12 - Voice Interface](../epics/epic-12-voice-interface.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** to give Cora quick voice commands for common actions,
**So that** I can get answers instantly without full conversations.

---

## Acceptance Criteria

### AC #1: Command Recognition
- **Given** user activates voice input
- **When** they say a quick command
- **Then** recognize and execute:
  - "What's my balance?" → Current account balance
  - "Safe to spend?" → Safe-to-Spend amount
  - "How much did I spend on groceries?" → Category spend
  - "Any alerts?" → Read pending insights
  - "What bills are coming up?" → Upcoming recurring expenses

### AC #2: Natural Language Variations
- **Given** users speak naturally
- **When** processing commands
- **Then** understand variations:
  - "How much can I spend?" = "Safe to spend?"
  - "What's my net worth?" = "Total balance?"
  - "Read my insights" = "Any alerts?"

### AC #3: Context-Aware Responses
- **Given** a quick command is recognized
- **When** responding
- **Then** provide concise spoken response:
  - "Your safe to spend is €847. You have €1,200 after bills, minus your €350 comfort floor."

### AC #4: Follow-Up Handling
- **Given** user asks a quick question
- **When** Cora responds
- **Then** listen for follow-up:
  - User: "What's my balance?"
  - Cora: "Your total balance is €5,432 across 3 accounts."
  - User: "Break it down"
  - Cora: "Moey checking: €2,100. Savings: €3,000. ActivoBank: €332."

### AC #5: Command Suggestions
- **Given** user taps microphone for first time
- **When** showing listening state
- **Then** display suggested commands: "Try saying: 'What's my balance?' or 'Any alerts?'"

---

## Technical Notes

- Create intent classification for quick commands
- Map intents to existing API endpoints
- Use conversation context for follow-ups

### Command Intent Mapping
```typescript
const quickCommands = [
  {
    intent: 'balance',
    patterns: ['what\'s my balance', 'how much do I have', 'total balance', 'account balance'],
    action: 'getBalance',
  },
  {
    intent: 'safe_to_spend',
    patterns: ['safe to spend', 'how much can I spend', 'what can I spend'],
    action: 'getSafeToSpend',
  },
  {
    intent: 'category_spend',
    patterns: ['how much on {category}', 'spent on {category}', '{category} spending'],
    action: 'getCategorySpend',
    extractParams: ['category'],
  },
  {
    intent: 'insights',
    patterns: ['any alerts', 'read insights', 'what\'s new', 'any warnings'],
    action: 'getInsights',
  },
  {
    intent: 'upcoming_bills',
    patterns: ['upcoming bills', 'what bills', 'bills coming up', 'next expenses'],
    action: 'getUpcomingBills',
  },
];
```

### Intent Classification
```typescript
function classifyIntent(transcript: string): { intent: string; params: Record<string, string> } | null {
  const normalizedTranscript = transcript.toLowerCase().trim();
  
  for (const command of quickCommands) {
    for (const pattern of command.patterns) {
      if (matchesPattern(normalizedTranscript, pattern)) {
        return {
          intent: command.intent,
          params: extractParams(normalizedTranscript, pattern, command.extractParams),
        };
      }
    }
  }
  
  return null; // Fall back to full AI processing
}
```

### Concise Response Templates
```typescript
const responseTemplates = {
  balance: (data) => 
    `Your total balance is €${data.total} across ${data.accountCount} accounts.`,
  safe_to_spend: (data) =>
    `Your safe to spend is €${data.amount}. You have €${data.available} after bills, minus your €${data.floor} comfort floor.`,
  category_spend: (data) =>
    `You've spent €${data.amount} on ${data.category} this month.`,
};
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/voice/command-recognition.ts` | Create |
| `src/lib/voice/quick-commands.ts` | Create |
| `src/components/chat/VoiceCommandSuggestions.tsx` | Create |

---

## Prerequisites

- Story 12.1: Speech-to-Text Integration
- Story 12.2: Text-to-Speech Responses

---

## Definition of Done

- [ ] 5+ quick commands recognized
- [ ] Natural language variations handled
- [ ] Concise spoken responses
- [ ] Follow-up handling works
- [ ] Command suggestions displayed
- [ ] Bilingual commands (PT-PT/EN-US)
- [ ] Fallback to full AI for unknown commands
