import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

import { getCodeImg, login as loginApi } from '~/shared/api/login'
import { auth, SaaSRole } from '~/shared/auth/client'
import {
  clearRememberLogin,
  loadRememberLogin,
  saveRememberLogin,
} from '~/shared/lib/remember-login'

import type { Route } from './+types/login'

import './login.css'

const loginFormSchema = z.object({
  username: z.string().min(1, '请输入您的账号'),
  password: z.string().min(1, '请输入您的密码'),
  code: z.string().min(1, '请输入验证码'),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

const loginInputClassName =
  'login-autofill-input h-12 w-full rounded-[6.06px] border-[0.89px] border-white/64 bg-black/23 px-3 text-sm text-white shadow-none outline-none placeholder:text-white/55 focus-visible:border-[#3094ff]'

function PasswordToggleIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 3l18 18M10.58 10.58A2 2 0 0 0 12 15a2 2 0 0 0 1.42-.58M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7a11.35 11.35 0 0 1-2.12 3.17M6.61 6.61A11.33 11.33 0 0 0 1 12c1.73 3.89 6 7 11 7 1.52 0 2.95-.3 4.24-.84"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function resolveUserEmail(username: string): string {
  return username.includes('@') ? username : `${username}@yunyan.local`
}

export function meta(_args: Route.MetaArgs) {
  return [{ title: '登录 · saas-web' }]
}

export async function clientLoader() {
  return null
}

export default function Login() {
  const navigate = useNavigate()
  const [captchaEnabled, setCaptchaEnabled] = useState(true)
  const [codeUrl, setCodeUrl] = useState('')
  const [uuid, setUuid] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginFormSchema),
    defaultValues: { username: '', password: '', code: '' },
  })

  const loadCaptcha = useCallback(async () => {
    try {
      const res = await getCodeImg()
      setCaptchaEnabled(res.captchaEnabled)
      if (res.captchaEnabled) {
        setCodeUrl(`data:image/gif;base64,${res.img}`)
        setUuid(res.uuid)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '验证码加载失败')
    }
  }, [])

  useEffect(() => {
    void loadCaptcha()
  }, [loadCaptcha])

  useEffect(() => {
    const saved = loadRememberLogin()
    if (!saved) return

    reset({
      username: saved.username,
      password: saved.password,
      code: '',
    })
    setRememberMe(saved.rememberMe)
  }, [reset])

  async function onSubmit(values: LoginFormValues) {
    setErrorMessage(null)

    if (rememberMe) {
      saveRememberLogin(values.username, values.password)
    } else {
      clearRememberLogin()
    }

    try {
      const token = await loginApi({
        username: values.username,
        password: values.password,
        code: values.code,
        uuid,
      })

      auth.setSession(
        {
          user: {
            id: values.username.trim(),
            email: resolveUserEmail(values.username.trim()),
            name: values.username.trim(),
            roles: [SaaSRole.MEMBER],
          },
          tenant: null,
        },
        { accessToken: token },
      )

      void navigate('/', { replace: true })
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '登录失败')
      await loadCaptcha()
    }
  }

  return (
    <div className="box-border w-[570px] max-w-full rounded-[26.82px] border-[2.72px] border-[#3094ff] bg-[linear-gradient(180deg,rgba(48,97,219,0.12)_0%,rgba(23,62,160,0.5)_100%)] px-[89px] py-[51px]">
      <div
        className="mx-auto mb-[51px] h-[71px] w-[352px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login-title.webp')" }}
        role="img"
        aria-label="登录"
      />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1.5">
          <label className="sr-only" htmlFor="login-username">
            账号
          </label>
          <input
            id="login-username"
            autoComplete="username"
            className={loginInputClassName}
            placeholder="账号"
            {...register('username')}
          />
          {errors.username ? (
            <p className="text-xs text-[#ffb4b4]">{errors.username.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sr-only" htmlFor="login-password">
            密码
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`${loginInputClassName} pr-11`}
              placeholder="密码"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-white [&_svg]:size-[19px]"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <PasswordToggleIcon visible={showPassword} />
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-[#ffb4b4]">{errors.password.message}</p>
          ) : null}
        </div>

        {captchaEnabled ? (
          <div className="flex flex-col gap-1.5">
            <label className="sr-only" htmlFor="login-code">
              验证码
            </label>
            <div className="flex items-center">
              <input
                id="login-code"
                autoComplete="off"
                className={`${loginInputClassName} w-[63%] shrink-0 flex-1`}
                placeholder="验证码"
                {...register('code')}
              />
              {codeUrl ? (
                <button
                  type="button"
                  className="flex h-12 shrink-0 cursor-pointer items-center border-0 bg-transparent p-0"
                  onClick={() => void loadCaptcha()}
                  aria-label="刷新验证码"
                >
                  <img alt="验证码" className="h-12 w-auto object-contain pl-3" src={codeUrl} />
                </button>
              ) : null}
            </div>
            {errors.code ? <p className="text-xs text-[#ffb4b4]">{errors.code.message}</p> : null}
          </div>
        ) : null}

        <label className="mb-[25px] flex cursor-pointer select-none items-center gap-2 has-[:checked]:[&>span]:text-[#3094ff]">
          <input
            checked={rememberMe}
            type="checkbox"
            className="size-4 cursor-pointer accent-[#3094ff]"
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span className="cursor-pointer text-base text-white">记住密码</span>
        </label>

        {errorMessage ? <p className="text-sm text-[#ffb4b4]">{errorMessage}</p> : null}

        <button
          className="h-12 w-full cursor-pointer rounded-[5.35px] border-0 bg-[linear-gradient(144.03deg,rgba(89,170,249,1)_0%,rgba(45,125,245,1)_100%)] text-xl text-white hover:enabled:bg-[#79bbff] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '登 录 中...' : '登录系统'}
        </button>
      </form>
    </div>
  )
}
