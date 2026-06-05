import { z } from 'zod'

export const menuMetaSchema = z
  .object({
    title: z.string().optional(),
    icon: z.string().optional(),
    noCache: z.boolean().optional(),
    link: z.string().nullable().optional(),
  })
  .passthrough()

export type MenuMeta = z.infer<typeof menuMetaSchema>

export interface MenuRoute {
  /** Vue Router name；顶层 Layout 包装项常无 name */
  name?: string
  path: string
  hidden?: boolean
  component?: string
  redirect?: string
  alwaysShow?: boolean
  query?: string
  meta?: MenuMeta
  children?: MenuRoute[]
  [key: string]: unknown
}

export const menuRouteSchema: z.ZodType<MenuRoute> = z.lazy(() =>
  z
    .object({
      name: z.string().optional(),
      path: z.string(),
      hidden: z.boolean().optional(),
      component: z.string().optional(),
      redirect: z.string().optional(),
      alwaysShow: z.boolean().optional(),
      query: z.string().optional(),
      meta: menuMetaSchema.optional(),
      children: z.array(menuRouteSchema).optional(),
    })
    .passthrough(),
)

export const menuRoutersResponseSchema = z
  .object({
    code: z.number().optional(),
    msg: z.string().optional(),
    data: z.array(menuRouteSchema),
  })
  .passthrough()
