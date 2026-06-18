import { z } from 'zod'

import { api } from './client'

export const menuItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['map-tool', 'map-dock-module', 'map-module', 'route', 'external']),
  icon: z.string(),
  toolId: z.string().nullable().optional(),
  moduleId: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  href: z.string().nullable().optional(),
  permissionCode: z.string().nullable().optional(),
})

export const menuSectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  collapsible: z.boolean(),
  defaultOpen: z.boolean(),
  storageKey: z.string().nullable().optional(),
  items: z.array(menuItemSchema),
})

export const menusResponseSchema = z.object({
  sections: z.array(menuSectionSchema),
  items: z.array(menuItemSchema),
})

export type MenuItemDto = z.infer<typeof menuItemSchema>
export type MenuSectionDto = z.infer<typeof menuSectionSchema>
export type MenusResponse = z.infer<typeof menusResponseSchema>

export async function fetchWorkspaceMenus() {
  return menusResponseSchema.parse(await api.get<MenusResponse>('/menus'))
}
