import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  layout('layouts/auth-layout.tsx', [route('login', 'routes/login.tsx')]),
  layout('layouts/app-layout.tsx', [
    index('routes/home.tsx', { id: 'routes/home' }),
    route(':section/:moduleId', 'routes/home.tsx', { id: 'routes/workspace-module' }),
  ]),
] satisfies RouteConfig
