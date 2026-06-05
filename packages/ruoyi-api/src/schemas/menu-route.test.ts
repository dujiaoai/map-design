import { describe, expect, it } from 'vitest'

import { menuRoutersResponseSchema } from './menu-route'

/** 摘自 /system/menu/getRouters 真实响应片段 */
const sampleResponse = {
  msg: '操作成功',
  code: 200,
  data: [
    {
      path: '/',
      hidden: false,
      component: 'Layout',
      children: [
        {
          name: 'Map/index',
          path: 'map/index',
          hidden: false,
          meta: { title: '云瞰(2D)', icon: '#', noCache: false, link: null },
        },
      ],
    },
    {
      name: '/test',
      path: '//test',
      hidden: false,
      redirect: 'noRedirect',
      component: 'Layout',
      alwaysShow: true,
      meta: { title: '测试', icon: '#', noCache: false, link: null },
      children: [
        {
          name: '/test',
          path: '/test',
          hidden: false,
          component: '1',
          query: '1',
          meta: { title: 'test1', icon: '#', noCache: false, link: null },
        },
      ],
    },
    {
      name: 'Monitor',
      path: '/monitor',
      hidden: false,
      redirect: 'noRedirect',
      component: 'Layout',
      alwaysShow: true,
      meta: { title: '系统监控', icon: 'monitor', noCache: false, link: null },
      children: [
        {
          name: 'Http://172.31.40.225:8718',
          path: 'http://172.31.40.225:8718',
          hidden: false,
          component: 'Layout',
          meta: {
            title: 'Sentinel控制台',
            icon: 'sentinel',
            noCache: false,
            link: 'http://172.31.40.225:8718',
          },
        },
      ],
    },
  ],
}

describe('menuRoutersResponseSchema', () => {
  it('parses RuoYi getRouters envelope and nested routes', () => {
    const parsed = menuRoutersResponseSchema.parse(sampleResponse)
    expect(parsed.code).toBe(200)
    expect(parsed.data).toHaveLength(3)
    expect(parsed.data[0]?.children?.[0]?.meta?.title).toBe('云瞰(2D)')
    expect(parsed.data[1]?.children?.[0]?.query).toBe('1')
    expect(parsed.data[2]?.children?.[0]?.meta?.link).toBe('http://172.31.40.225:8718')
  })
})
