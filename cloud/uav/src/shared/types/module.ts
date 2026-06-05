export interface CloudPluginUavModule {
  mount(container: string | HTMLElement): Promise<void>
  unmount(container: string | HTMLElement): Promise<void>
  /** dev：热更新时复用 root 重渲染，避免整页刷新 */
  reload?(container: string | HTMLElement): Promise<void>
  version?: string
}
