import type { RuoYiClient } from './client'
import { type UserInfo, userInfoSchema } from './schemas/user-info'
import {
  type RuoYiActionResponse,
  ruoYiActionResponseSchema,
  type UpdateUserPasswordPayload,
  type UpdateUserProfilePayload,
} from './schemas/user-profile-mutation'
import { type UserProfile, userProfileSchema } from './schemas/user-profile'

export async function getUserInfo(client: RuoYiClient): Promise<UserInfo> {
  const body = await client.get<unknown>('/system/user/getInfo')
  return userInfoSchema.parse(body)
}

export async function getUserProfile(client: RuoYiClient): Promise<UserProfile> {
  const body = await client.get<unknown>('/system/user/profile')
  return userProfileSchema.parse(body)
}

export async function updateUserProfile(
  client: RuoYiClient,
  payload: UpdateUserProfilePayload,
): Promise<RuoYiActionResponse> {
  const body = await client.put<unknown>('/system/user/profile', payload)
  return ruoYiActionResponseSchema.parse(body)
}

export async function updateUserPassword(
  client: RuoYiClient,
  payload: UpdateUserPasswordPayload,
): Promise<RuoYiActionResponse> {
  const body = await client.put<unknown>('/system/user/profile/updatePwd', payload)
  return ruoYiActionResponseSchema.parse(body)
}
