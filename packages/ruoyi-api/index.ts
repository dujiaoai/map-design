export { createRuoYiClient, RuoYiApiError, type RuoYiClient, type RuoYiClientOptions } from './src/client'
export { getCodeImg, login, type CaptchaResult, type LoginParams } from './src/auth'
export { getUserInfo, getUserProfile, updateUserProfile, updateUserPassword } from './src/user'
export { getMenuRouters } from './src/menu'
export {
  menuMetaSchema,
  menuRouteSchema,
  menuRoutersResponseSchema,
  type MenuMeta,
  type MenuRoute,
} from './src/schemas/menu-route'
export {
  ruoYiRoleSchema,
  ruoYiUserSchema,
  userInfoSchema,
  type RuoYiRole,
  type RuoYiUser,
  type UserInfo,
} from './src/schemas/user-info'
export {
  userProfileSchema,
  type UserProfile,
} from './src/schemas/user-profile'
export {
  type RuoYiActionResponse,
  type UpdateUserPasswordPayload,
  type UpdateUserProfilePayload,
} from './src/schemas/user-profile-mutation'
