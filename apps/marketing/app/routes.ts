import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  layout('layouts/marketing-layout.tsx', [
    index('routes/home.tsx'),
    route('pricing', 'routes/pricing.tsx'),
    route('sign-up', 'routes/sign-up.tsx'),
  ]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
