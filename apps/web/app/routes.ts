import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  layout('layouts/auth-layout.tsx', [
    route('login', 'routes/login.tsx'),
    route('auth/oidc/callback/:providerId', 'routes/auth.oidc.callback.$providerId.tsx'),
    route('auth/tenant-sso/saml/callback/:slug', 'routes/auth.tenant-sso.saml.callback.$slug.tsx'),
    route('register', 'routes/register.tsx'),
    route('accept-invite', 'routes/accept-invite.tsx'),
    route('join', 'routes/join.tsx'),
    route('forgot-password', 'routes/forgot-password.tsx'),
    route('reset-password', 'routes/reset-password.tsx'),
    route('verify-email', 'routes/verify-email.tsx'),
    route('resend-verification', 'routes/resend-verification.tsx'),
    route('dev/saas-auth-smoke', 'routes/dev.saas-auth-smoke.tsx'),
  ]),
  layout('layouts/app-layout.tsx', [
    index('routes/home.tsx', { id: 'routes/home' }),
    route(':section/:moduleId', 'routes/home.tsx', { id: 'routes/workspace-module' }),
    route('billing', 'routes/billing.tsx'),
    route('403', 'routes/forbidden.tsx'),
  ]),
] satisfies RouteConfig
