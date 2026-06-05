import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <div
      className="flex min-h-svh items-center justify-center bg-cover bg-center bg-no-repeat p-6"
      style={{ backgroundImage: "url('/images/login-background.webp')" }}
    >
      <Outlet />
    </div>
  )
}
