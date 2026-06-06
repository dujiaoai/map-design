import type { CSSProperties } from 'react'

/** 多个收起 Dock 左缘标签：沿垂直方向居中堆叠 */
export function resolveDockEdgeStackStyle(
  stackIndex: number,
  stackCount: number,
): CSSProperties {
  if (stackCount <= 1) {
    return { top: '50%', transform: 'translateY(-50%)' }
  }

  const stepRem = 3.25
  const offsetRem = (stackIndex - (stackCount - 1) / 2) * stepRem
  return {
    top: '50%',
    transform: `translateY(calc(-50% + ${offsetRem}rem))`,
  }
}
