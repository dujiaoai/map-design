import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  layout('layouts/auth-layout.tsx', [
    route('login', 'routes/login.tsx'),
    route('auth/oidc/callback/:providerId', 'routes/auth.oidc.callback.$providerId.tsx'),
    route('forgot-password', 'routes/forgot-password.tsx'),
    route('reset-password', 'routes/reset-password.tsx'),
  ]),
  layout('layouts/admin-layout.tsx', [
    index('routes/dashboard.tsx', { id: 'routes/dashboard' }),
    route('tenants', 'routes/tenants.tsx'),
    route('tenants/:tenantId', 'routes/tenants.$tenantId.tsx'),
    route('users', 'routes/users.tsx'),
    route('members', 'routes/members.tsx'),
    route('tenant-roles', 'routes/tenant-roles.tsx'),
    route('roles', 'routes/roles.tsx'),
    route('permissions', 'routes/permissions.tsx'),
    route('account', 'routes/account.tsx'),
    route('audit-logs', 'routes/audit-logs.tsx'),
    route('billing', 'routes/billing.tsx'),
    route('system', 'routes/system.tsx'),
  ]),
  route('403', 'routes/forbidden.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
