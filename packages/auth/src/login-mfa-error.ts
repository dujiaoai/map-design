export class LoginMfaRequiredError extends Error {
  readonly challengeToken: string
  readonly userEmail?: string

  constructor(challengeToken: string, userEmail?: string) {
    super('MFA required')
    this.name = 'LoginMfaRequiredError'
    this.challengeToken = challengeToken
    this.userEmail = userEmail
  }
}

export function isLoginMfaRequiredError(error: unknown): error is LoginMfaRequiredError {
  return error instanceof LoginMfaRequiredError
}
