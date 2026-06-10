/** @deprecated Sprint D-09：权限 helpers 已迁至 `@repo/auth` 与 `shared/session` */
export {
  hasAnyPermission,
  hasPermission,
  hasRoleKey,
  isAdmin,
} from './lib/permissions'
export { toNavUserData } from './lib/to-nav-user-data'
export { resolveAvatarSrc, DEFAULT_AVATAR_URL, isBlankAvatarValue } from './lib/resolve-avatar-src'
export { mergeRuoYiUser } from './lib/merge-ruoyi-user'
export { formatCreateTime, formatDeptLabel, formatSex } from './lib/format-profile-fields'
export {
  useCanAccessWorkspace,
  useCanReadMap,
  useCanWriteMap,
  useHasAnyPermission,
  useHasPermission,
  useHasRoleKey,
  useHasSaasRole,
  useIsRuoYiAdmin,
  useIsTenantOrPlatformAdmin,
  useRuoYiPermissions,
  useRuoYiProfile,
  useSessionPermissions,
} from './hooks/use-ruoyi-profile'
