import { describe, expect, it } from 'vitest'

import { resolveDockEdgeStackStyle } from './dock-edge-stack-style'

describe('resolveDockEdgeStackStyle', () => {
  it('centers a single edge tab', () => {
    expect(resolveDockEdgeStackStyle(0, 1)).toEqual({
      top: '50%',
      transform: 'translateY(-50%)',
    })
  })

  it('stacks two edge tabs vertically around center', () => {
    expect(resolveDockEdgeStackStyle(0, 2)).toEqual({
      top: '50%',
      transform: 'translateY(calc(-50% + -1.625rem))',
    })
    expect(resolveDockEdgeStackStyle(1, 2)).toEqual({
      top: '50%',
      transform: 'translateY(calc(-50% + 1.625rem))',
    })
  })
})
