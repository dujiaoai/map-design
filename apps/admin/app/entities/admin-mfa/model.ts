export interface AdminMfaStatusResponse {
  enforcementEnabled: boolean
  totpEnrollmentAvailable: boolean
  enrolled: boolean
  verifiedAt: number | null
  recoveryCodesRemaining: number
  recoveryCodes?: string[] | null
}

export interface TotpEnrollResponse {
  secret: string
  otpauthUri: string
  qrCodeDataUrl: string
}
