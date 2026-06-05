import type { NavMainItem, NavMainSubItem } from '../model/types'

import { findNavLeafById } from './nav-leaves'

/** 在菜单树中按 id 查找叶子子项（含一级叶子如「导入」） */
export function findNavSubItem(items: NavMainItem[], id: string): NavMainSubItem | undefined {
  return findNavLeafById(items, id)
}
