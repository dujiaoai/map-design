import { describe, expect, it } from 'vitest'

import { formatInvoiceStatus, formatInvoiceType } from './invoice-labels'

describe('invoice labels', () => {
  it('formats known status and type', () => {
    expect(formatInvoiceStatus('pending')).toBe('待处理')
    expect(formatInvoiceStatus('issued')).toBe('已开具')
    expect(formatInvoiceType('enterprise')).toBe('企业')
  })

  it('falls back to raw value', () => {
    expect(formatInvoiceStatus('unknown')).toBe('unknown')
  })
})
