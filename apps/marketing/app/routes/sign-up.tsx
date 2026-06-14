import { redirect } from 'react-router'

import { webRegisterPersonalUrl } from '~/shared/config/web-app-url'

export function clientLoader() {
  return redirect(webRegisterPersonalUrl())
}

export default function SignUpRoute() {
  return null
}
