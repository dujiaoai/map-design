export function dateInputToFromEpoch(date: string): number | undefined {
  const trimmed = date.trim()
  if (!trimmed) return undefined
  return new Date(`${trimmed}T00:00:00`).getTime()
}

export function dateInputToToEpoch(date: string): number | undefined {
  const trimmed = date.trim()
  if (!trimmed) return undefined
  return new Date(`${trimmed}T23:59:59.999`).getTime()
}
