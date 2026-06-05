export function resolveContainer(
  container: string | HTMLElement,
  options: { required?: boolean } = {},
): HTMLElement | null {
  const { required = true } = options
  const el = typeof container === 'string' ? document.querySelector(container) : container

  if (!el && required) {
    throw new Error(`[cloud-plugin-uav] mount target not found: ${String(container)}`)
  }

  return el
}
