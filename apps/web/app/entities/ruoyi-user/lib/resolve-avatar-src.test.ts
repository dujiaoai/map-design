import { describe, expect, it } from 'vitest'

import { isBlankAvatarValue, resolveAvatarSrc } from './resolve-avatar-src'

describe('resolveAvatarSrc', () => {
  it('returns default for blank values', () => {
    expect(resolveAvatarSrc('')).toBe('/avatars/shadcn.jpg')
    expect(resolveAvatarSrc('#')).toBe('/avatars/shadcn.jpg')
    expect(isBlankAvatarValue('#')).toBe(true)
  })

  it('keeps data url unchanged', () => {
    const dataUrl = 'data:image/png;base64,abc'
    expect(resolveAvatarSrc(dataUrl)).toBe(dataUrl)
  })

  it('adds jpeg prefix for /9j/ base64', () => {
    expect(resolveAvatarSrc('/9j/abc')).toBe('data:image/jpeg;base64,/9j/abc')
  })
})
