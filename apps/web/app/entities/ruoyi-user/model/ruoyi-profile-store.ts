import type { RuoYiUser, UserInfo } from '@repo/ruoyi-api'
import { create } from 'zustand'

interface RuoYiProfileState {
  user: RuoYiUser | null
  roles: string[]
  permissions: string[]
  hydrated: boolean
  setProfile: (info: UserInfo) => void
  clear: () => void
}

const initialState = {
  user: null,
  roles: [] as string[],
  permissions: [] as string[],
  hydrated: false,
}

/** RuoYi getInfo 结果：权限/RBAC 专用 store（与 @repo/auth token session 分离） */
export const useRuoYiProfileStore = create<RuoYiProfileState>((set) => ({
  ...initialState,

  setProfile(info) {
    set({
      user: info.user,
      roles: info.roles,
      permissions: info.permissions,
      hydrated: true,
    })
  },

  clear() {
    set({ ...initialState, hydrated: true })
  },
}))
