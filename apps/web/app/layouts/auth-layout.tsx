import { Outlet } from 'react-router'

/** 认证页壳层：具体布局由子路由（如 login）自行编排 */
export default function AuthLayout() {
  return <Outlet />
}
