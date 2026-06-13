import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  layout('layouts/auth-layout.tsx', [
    route('login', 'routes/login.tsx'),
    route('register', 'routes/register.tsx'),
    route('accept-invite', 'routes/accept-invite.tsx'),
    route('forgot-password', 'routes/forgot-password.tsx'),
    route('reset-password', 'routes/reset-password.tsx'),
    route('dev/saas-auth-smoke', 'routes/dev.saas-auth-smoke.tsx'),
  ]),
  layout('layouts/app-layout.tsx', [
    index('routes/home.tsx', { id: 'routes/home' }),
    route(':section/:moduleId', 'routes/home.tsx', { id: 'routes/workspace-module' }),
    route('403', 'routes/forbidden.tsx'),
  ]),
] satisfies RouteConfig
