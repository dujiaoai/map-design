export interface OidcProvidersResponse {
  enabled: boolean
  authorizationCodeFlowAvailable: boolean
  providers: Array<{ id: string; displayName: string }>
}

export interface OidcAuthorizeResponse {
  authorizationUrl: string
  state: string
}
