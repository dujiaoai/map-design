import { describe, expect, it, beforeEach } from 'vitest'

import {
  type AdminTableColumnDef,
  useAdminTableColumnPrefs,
} from '~/shared/hooks/use-admin-table-column-prefs'
import { renderHook, act } from '@testing-library/react'

const COLUMNS: AdminTableColumnDef[] = [
  { key: 'email', label: '邮箱' },
  { key: 'status', label: '状态', defaultVisible: false },
]

describe('useAdminTableColumnPrefs', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('uses defaults when storage is empty', () => {
    const { result } = renderHook(() => useAdminTableColumnPrefs('users', COLUMNS))
    expect(result.current.isColumnVisible('email')).toBe(true)
    expect(result.current.isColumnVisible('status')).toBe(false)
  })

  it('persists visibility changes', () => {
    const { result } = renderHook(() => useAdminTableColumnPrefs('users', COLUMNS))

    act(() => {
      result.current.setColumnVisible('status', true)
    })

    expect(result.current.isColumnVisible('status')).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('admin-table-columns:users') ?? '{}')).toEqual({
      email: true,
      status: true,
    })
  })

  it('prevents hiding every column', () => {
    const { result } = renderHook(() =>
      useAdminTableColumnPrefs('users', [{ key: 'email', label: '邮箱' }]),
    )

    act(() => {
      result.current.setColumnVisible('email', false)
    })

    expect(result.current.isColumnVisible('email')).toBe(true)
  })
})
