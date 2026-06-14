/** 顶栏余额低于此阈值时显示低余额警示样式 */
export const LOW_BALANCE_THRESHOLD = 50

export function isLowBalance(availableBalance: number): boolean {
  return availableBalance >= 0 && availableBalance < LOW_BALANCE_THRESHOLD
}
