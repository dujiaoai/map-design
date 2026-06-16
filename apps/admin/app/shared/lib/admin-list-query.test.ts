import { describe, expect, it } from 'vitest'

import { buildAdminListQuery } from '~/shared/lib/admin-list-query'

describe('buildAdminListQuery', () => {
  it('includes sort and tenantId params', () => {
    const query = buildAdminListQuery({
      tenantId: 't-1',
      sortBy: 'email',
      sortDir: 'desc',
      page: 2,
      size: 20,
    })

    expect(query).toBe('?page=2&size=20&sortBy=email&sortDir=desc&tenantId=t-1')
  })
})
