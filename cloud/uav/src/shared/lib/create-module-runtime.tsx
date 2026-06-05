import { type ComponentType, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { PLUGIN_VERSION } from '@/shared/config/version'
import { resolveContainer } from '@/shared/lib/resolve-container'
import type { CloudPluginUavModule } from '@/shared/types/module'
import '@/shared/styles/index.css'

export interface CreateCloudPluginModuleOptions {
  scopeClass?: string
  /** dev reload 时动态 import 的模块 specifier（含 base 的绝对路径） */
  devReloadSpecifier?: string
}

export function createCloudPluginModule(
  App: ComponentType,
  options: CreateCloudPluginModuleOptions = {},
): CloudPluginUavModule {
  const scopeClass = options.scopeClass ?? 'yunyan-cloud-uav'
  const roots = new WeakMap<HTMLElement, Root>()

  function renderApp(root: Root, AppComponent: ComponentType) {
    root.render(
      <StrictMode>
        <AppComponent />
      </StrictMode>,
    )
  }

  async function mount(container: string | HTMLElement): Promise<void> {
    const el = resolveContainer(container)
    if (!el) return

    if (roots.has(el)) {
      throw new Error('[cloud-plugin-uav] container already mounted')
    }

    el.classList.add(scopeClass)

    const root = createRoot(el)
    roots.set(el, root)
    renderApp(root, App)
  }

  async function unmount(container: string | HTMLElement): Promise<void> {
    const el = resolveContainer(container, { required: false })
    if (!el) return

    const root = roots.get(el)
    if (!root) return

    root.unmount()
    roots.delete(el)
  }

  async function reload(container: string | HTMLElement): Promise<void> {
    const el = resolveContainer(container, { required: false })
    if (!el) return

    const root = roots.get(el)
    if (!root) {
      await mount(container)
      return
    }

    if (import.meta.env.DEV && options.devReloadSpecifier) {
      const mod = await import(
        /* @vite-ignore */ `${options.devReloadSpecifier}?reload=${Date.now()}`
      )
      const NextApp = mod.App as ComponentType | undefined
      if (!NextApp) {
        throw new Error(
          `[cloud-plugin-uav] dev reload missing App export: ${options.devReloadSpecifier}`,
        )
      }
      renderApp(root, NextApp)
      return
    }

    renderApp(root, App)
  }

  return {
    mount,
    unmount,
    reload,
    version: PLUGIN_VERSION,
  }
}
