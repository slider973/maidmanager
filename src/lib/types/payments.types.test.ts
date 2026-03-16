/**
 * Payments Types Utility Functions Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect } from 'vitest'
import {
  formatMoney,
  parseMoney,
  hoursToMinutes,
  minutesToHours,
  formatDuration,
  calculateAmount,
} from './payments.types'

describe('formatMoney', () => {
  it('should format cents to CHF currency string', () => {
    // fr-CH locale formats as "CHF 45.00" or similar
    expect(formatMoney(4500)).toContain('45')
    expect(formatMoney(4500)).toContain('CHF')
  })

  it('should handle zero', () => {
    expect(formatMoney(0)).toContain('0')
    expect(formatMoney(0)).toContain('CHF')
  })

  it('should handle large amounts', () => {
    expect(formatMoney(100000)).toContain('1')
    expect(formatMoney(100000)).toContain('000')
    expect(formatMoney(100000)).toContain('CHF')
  })

  it('should handle negative amounts', () => {
    expect(formatMoney(-3500)).toContain('35')
    expect(formatMoney(-3500)).toContain('CHF')
  })
})

describe('parseMoney', () => {
  it('should parse CHF amount with dot separator to cents', () => {
    expect(parseMoney('45.50')).toBe(4550)
  })

  it('should parse CHF amount with comma separator to cents', () => {
    expect(parseMoney('45,50')).toBe(4550)
  })

  it('should parse whole number', () => {
    expect(parseMoney('100')).toBe(10000)
  })

  it('should handle currency symbols', () => {
    expect(parseMoney('CHF 45.50')).toBe(4550)
  })

  it('should return 0 for invalid input', () => {
    expect(parseMoney('invalid')).toBe(0)
  })
})

describe('hoursToMinutes', () => {
  it('should convert 1.5 hours to 90 minutes', () => {
    expect(hoursToMinutes(1.5)).toBe(90)
  })

  it('should convert 1 hour to 60 minutes', () => {
    expect(hoursToMinutes(1)).toBe(60)
  })

  it('should convert 0.5 hours to 30 minutes', () => {
    expect(hoursToMinutes(0.5)).toBe(30)
  })

  it('should handle zero', () => {
    expect(hoursToMinutes(0)).toBe(0)
  })

  it('should round to nearest minute', () => {
    expect(hoursToMinutes(1.33)).toBe(80)
  })
})

describe('minutesToHours', () => {
  it('should convert 90 minutes to 1.5 hours', () => {
    expect(minutesToHours(90)).toBe(1.5)
  })

  it('should convert 60 minutes to 1 hour', () => {
    expect(minutesToHours(60)).toBe(1)
  })

  it('should convert 30 minutes to 0.5 hours', () => {
    expect(minutesToHours(30)).toBe(0.5)
  })

  it('should handle zero', () => {
    expect(minutesToHours(0)).toBe(0)
  })
})

describe('formatDuration', () => {
  it('should format 90 minutes as "1h30"', () => {
    expect(formatDuration(90)).toBe('1h30')
  })

  it('should format 60 minutes as "1h"', () => {
    expect(formatDuration(60)).toBe('1h')
  })

  it('should format 30 minutes as "30min"', () => {
    expect(formatDuration(30)).toBe('30min')
  })

  it('should format 125 minutes as "2h05"', () => {
    expect(formatDuration(125)).toBe('2h05')
  })

  it('should format 0 minutes as "0min"', () => {
    expect(formatDuration(0)).toBe('0min')
  })
})

describe('calculateAmount', () => {
  it('should calculate amount for 90 minutes at 15€/h (1500 cents)', () => {
    // 1.5h × 15€ = 22.50€ = 2250 cents
    expect(calculateAmount(90, 1500)).toBe(2250)
  })

  it('should calculate amount for 180 minutes at 15€/h (1500 cents)', () => {
    // 3h × 15€ = 45€ = 4500 cents
    expect(calculateAmount(180, 1500)).toBe(4500)
  })

  it('should calculate amount for 60 minutes at 12€/h (1200 cents)', () => {
    // 1h × 12€ = 12€ = 1200 cents
    expect(calculateAmount(60, 1200)).toBe(1200)
  })

  it('should handle zero duration', () => {
    expect(calculateAmount(0, 1500)).toBe(0)
  })

  it('should handle zero rate (volunteer work)', () => {
    expect(calculateAmount(180, 0)).toBe(0)
  })

  it('should round to nearest cent', () => {
    // 45 minutes at 10€/h = 0.75h × 10€ = 7.50€ = 750 cents
    expect(calculateAmount(45, 1000)).toBe(750)
  })
})
