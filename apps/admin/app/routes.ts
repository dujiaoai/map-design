import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  layout('layouts/auth-layout.tsx', [route('login', 'routes/login.tsx')]),
  layout('layouts/admin-layout.tsx', [
    index('routes/dashboard.tsx', { id: 'routes/dashboard' }),
    route('tenants', 'routes/tenants.tsx'),
    route('tenants/:tenantId', 'routes/tenants.$tenantId.tsx'),
    route('users', 'routes/users.tsx'),
    route('members', 'routes/members.tsx'),
    route('roles', 'routes/roles.tsx'),
  ]),
  route('403', 'routes/forbidden.tsx'),
] satisfies RouteConfig
