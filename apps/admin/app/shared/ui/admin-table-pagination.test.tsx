import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AdminTablePagination } from './admin-table-pagination'

describe('AdminTablePagination', () => {
  it('shows range summary and disables prev on first page', () => {
    render(<AdminTablePagination page={1} pageSize={20} total={45} onPageChange={vi.fn()} />)

    expect(screen.getByText('第 1–20 条，共 45 条')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一页' })).toBeEnabled()
  })

  it('calls onPageChange when navigating pages', () => {
    const onPageChange = vi.fn()

    render(<AdminTablePagination page={2} pageSize={10} total={25} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: '下一页' }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    fireEvent.click(screen.getByRole('button', { name: '上一页' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('shows empty state when total is zero', () => {
    render(<AdminTablePagination page={1} pageSize={20} total={0} onPageChange={vi.fn()} />)

    expect(screen.getByText('无数据')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled()
  })
})
