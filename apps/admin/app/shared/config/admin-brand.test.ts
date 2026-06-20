import { describe, expect, it } from 'vitest'

import { adminBrand } from './admin-brand'

describe('adminBrand', () => {
  it('provides default brand strings', () => {
    expect(adminBrand.appName).toBe('云眼运营后台')
    expect(adminBrand.defaultProductCode).toBe('map-design')
  })
})
