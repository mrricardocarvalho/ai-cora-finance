import { evaluateShouldSendNotification } from '../lib/services/notification-guard'

describe('evaluateShouldSendNotification', ()=>{
  const prefs = { urgent: true, opportunities: true, weekly_summary: false, quiet_hours_enabled: true, quiet_hours_start: '22:00', quiet_hours_end: '08:00' }
  it('returns false within quiet hours', async ()=>{
    // simulate 02:00 local time
    const tz = 'Europe/Lisbon'
    const date = new Date('2025-11-30T02:00:00Z')
    const res = await evaluateShouldSendNotification(prefs, tz, 'opportunities', date)
    expect(res).toBe(false)
  })
  it('returns true outside quiet hours', async ()=>{
    const tz = 'Europe/Lisbon'
    const date = new Date('2025-11-30T12:00:00Z')
    const res = await evaluateShouldSendNotification(prefs, tz, 'opportunities', date)
    expect(res).toBe(true)
  })
  it('obeys preference toggles', async ()=>{
    const disabled = { ...prefs, opportunities: false }
    const date = new Date('2025-11-30T12:00:00Z')
    expect(await evaluateShouldSendNotification(disabled, 'Europe/Lisbon', 'opportunities', date)).toBe(false)
  })
})
