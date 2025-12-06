import { formatCurrency, parseLocalizedNumber, formatDate, formatRelative, formatShortDate } from '../lib/utils/formatting'
import * as formatHelpers from '../lib/utils/formatting'

describe('formatting utilities', ()=>{
  test('formatCurrency uses pt-PT locale and shows € at end', ()=>{
    expect(formatCurrency(1234.56)).toBe('1.234,56 €')
    expect(formatCurrency(0)).toBe('0,00 €')
    expect(formatCurrency(-1234.5)).toContain('-')
  })
  test('formatNumber and formatMonthYear', ()=>{
    expect(formatHelpers.formatNumber(1234567.89)).toBe('1.234.567,89')
    const d = new Date('2025-11-29T12:00:00Z')
    expect(formatHelpers.formatMonthYear(d)).toMatch(/Nov\s+2025|nov\s+2025/i)
    expect(formatHelpers.formatNumber(-1234.5, 2)).toContain('-')
  })

  test('parseLocalizedNumber: basic cases', ()=>{
    expect(parseLocalizedNumber('1.234,56')).toBeCloseTo(1234.56)
    expect(parseLocalizedNumber('10,50')).toBeCloseTo(10.5)
    expect(parseLocalizedNumber('  1.234,56 €')).toBeCloseTo(1234.56)
    expect(parseLocalizedNumber('€1.234,56')).toBeCloseTo(1234.56)
    expect(parseLocalizedNumber('\u00A01.234,56\u00A0€')).toBeCloseTo(1234.56)
    expect(parseLocalizedNumber('1 234,56')).toBeCloseTo(1234.56)
    expect(parseLocalizedNumber('−1.234,56')).toBeCloseTo(-1234.56)
    expect(parseLocalizedNumber('(1.234,56)')).toBeCloseTo(-1234.56)
    expect(parseLocalizedNumber('')).toBe(0)
    expect(parseLocalizedNumber(undefined)).toBe(0)
    expect(parseLocalizedNumber(12)).toBe(12)
  })

  test('date formatting and short/relative', ()=>{
    const d = new Date('2025-11-29T12:00:00Z')
    expect(formatDate(d)).toBe('29/11/2025')
    expect(formatShortDate(d)).toMatch(/29\s+[A-Za-zÀ-ÖØ-öø-ÿ]{3}/)
    const past = new Date(Date.now() - (2*60*60*1000))
    const rel = formatRelative(past)
    expect(typeof rel).toBe('string')
    expect(rel.length).toBeGreaterThan(0)
  })
})
