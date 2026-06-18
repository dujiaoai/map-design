import { describe, expect, it } from 'vitest'

const SAMPLE = `[
  { "itemId": "tool-measure-distance", "enabled": false },
  { "itemId": "tool-measure-area", "sortOrder": 99 }
]`

function parseBatchJson(raw: string) {
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('JSON 须为非空数组')
  }
  return parsed
}

describe('tenant menu batch JSON', () => {
  it('parses override array', () => {
    const rows = parseBatchJson(SAMPLE)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ itemId: 'tool-measure-distance', enabled: false })
  })
})
