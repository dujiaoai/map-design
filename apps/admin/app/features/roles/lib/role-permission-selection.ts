export function togglePermissionCode(selectedCodes: string[], code: string): string[] {
  return selectedCodes.includes(code)
    ? selectedCodes.filter((item) => item !== code)
    : [...selectedCodes, code]
}

export function setScopePermissionCodes(
  selectedCodes: string[],
  scopeCodes: string[],
  select: boolean,
): string[] {
  if (select) {
    return [...new Set([...selectedCodes, ...scopeCodes])]
  }
  return selectedCodes.filter((code) => !scopeCodes.includes(code))
}
