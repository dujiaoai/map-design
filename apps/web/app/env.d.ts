/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'jsencrypt/bin/jsencrypt.min' {
  export default class JSEncrypt {
    setPublicKey(key: string): void
    setPrivateKey(key: string): void
    encrypt(value: string): string | false
    decrypt(value: string): string | false
  }
}
