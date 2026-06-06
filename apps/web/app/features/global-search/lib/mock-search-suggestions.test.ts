import { describe, expect, it } from 'vitest'

import { buildSearchSuggestions, parseCoordinateQuery } from './mock-search-suggestions'

describe('parseCoordinateQuery', () => {
  it('parses lng,lat pairs', () => {
    expect(parseCoordinateQuery('120.15, 30.28')).toEqual({ lng: 120.15, lat: 30.28 })
  })

  it('parses lat,lng pairs when values fit latitude range', () => {
    expect(parseCoordinateQuery('30.28, 120.15')).toEqual({ lng: 120.15, lat: 30.28 })
  })

  it('rejects invalid coordinates', () => {
    expect(parseCoordinateQuery('200, 30')).toBeNull()
    expect(parseCoordinateQuery('hello')).toBeNull()
  })
})

describe('buildSearchSuggestions', () => {
  it('returns hints when query is empty', () => {
    const suggestions = buildSearchSuggestions('')
    expect(suggestions.every((item) => item.kind === 'hint')).toBe(true)
    expect(suggestions.length).toBeGreaterThan(0)
  })

  it('returns coordinate suggestion for coordinate input', () => {
    const suggestions = buildSearchSuggestions('120.15,30.28')
    expect(suggestions[0]?.kind).toBe('coordinate')
  })

  it('filters places and features by query', () => {
    const suggestions = buildSearchSuggestions('西湖')
    expect(suggestions.some((item) => item.title.includes('西湖'))).toBe(true)
  })
})
