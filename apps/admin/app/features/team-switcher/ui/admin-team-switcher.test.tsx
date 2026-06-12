import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AdminTeamSwitcher } from './admin-team-switcher'

const teams = [
  { id: 't1', name: 'Demo Tenant', slug: 'demo', plan: 'pro', current: true },
  { id: 't2', name: 'Acme Corp', slug: 'acme', plan: 'free', current: false },
]

describe('AdminTeamSwitcher', () => {
  it('renders active team and triggers change callback', () => {
    const onTeamChange = vi.fn()

    render(
      <AdminTeamSwitcher teams={teams} activeTeamId="t1" onTeamChange={onTeamChange} />,
    )

    expect(screen.getByText('Demo Tenant')).toBeInTheDocument()
    expect(screen.getByText('demo')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Acme Corp'))

    expect(onTeamChange).toHaveBeenCalledWith('t2')
  })

  it('returns null when teams list is empty', () => {
    const { container } = render(
      <AdminTeamSwitcher teams={[]} activeTeamId={undefined} onTeamChange={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
