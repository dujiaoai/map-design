import type { RuoYiClient } from './client'
import { type MenuRoute, menuRoutersResponseSchema } from './schemas/menu-route'

export async function getMenuRouters(client: RuoYiClient): Promise<MenuRoute[]> {
  const body = await client.get<unknown>('/system/menu/getRouters')
  return menuRoutersResponseSchema.parse(body).data
}
