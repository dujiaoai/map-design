import type { Plugin, ViteDevServer } from 'vite'

const STUB_SOURCE = `
const sheetsMap = new Map()
if (typeof document !== 'undefined') {
  document.querySelectorAll('style[data-vite-dev-id]').forEach((el) => {
    sheetsMap.set(el.getAttribute('data-vite-dev-id'), el)
  })
}
const cspNonce =
  typeof document !== 'undefined'
    ? document.querySelector('meta[property=csp-nonce]')?.nonce
    : undefined
let lastInsertedStyle

function updateStyle(id, content) {
  let style = sheetsMap.get(id)
  if (!style) {
    style = document.createElement('style')
    style.setAttribute('type', 'text/css')
    style.setAttribute('data-vite-dev-id', id)
    style.textContent = content
    if (cspNonce) style.setAttribute('nonce', cspNonce)
    if (!lastInsertedStyle) {
      document.head.appendChild(style)
      setTimeout(() => {
        lastInsertedStyle = undefined
      }, 0)
    } else {
      lastInsertedStyle.insertAdjacentElement('afterend', style)
    }
    lastInsertedStyle = style
  } else {
    style.textContent = content
  }
  sheetsMap.set(id, style)
}

function removeStyle(id) {
  const style = sheetsMap.get(id)
  if (style) {
    document.head.removeChild(style)
    sheetsMap.delete(id)
  }
}

function createHotContext() {
  const noop = () => {}
  return {
    accept: noop,
    acceptDeps: noop,
    acceptExports: noop,
    decline: noop,
    dispose: noop,
    prune: noop,
    invalidate: noop,
    on: noop,
    off: noop,
    send: noop,
    data: {},
  }
}

function injectQuery(url, queryToInject) {
  if (url[0] !== '.' && url[0] !== '/') return url
  const pathname = url.replace(/[?#].*$/, '')
  const { search, hash } = new URL(url, 'http://vite.dev')
  return \`\${pathname}?\${queryToInject}\${search ? \`&\${search.slice(1)}\` : ''}\${hash || ''}\`
}

class ErrorOverlay extends HTMLElement {}

export { ErrorOverlay, createHotContext, injectQuery, removeStyle, updateStyle }
`

function isViteClientRequest(url: string): boolean {
  const pathname = url.split('?')[0]?.replace(/\\/g, '/') ?? url
  return pathname === '/@vite/client' || pathname.endsWith('/@vite/client')
}

function attachStubMiddleware(server: ViteDevServer): void {
  server.middlewares.use((req, res, next) => {
    const url = req.url ?? ''
    if (!isViteClientRequest(url)) {
      next()
      return
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/javascript')
    res.end(STUB_SOURCE)
  })
}

/**
 * 插件经宿主 proxy 加载时仍会被注入 @vite/client，且 server.origin 会把 WS 指向宿主端口。
 * 宿主 proxy 未转发 WS，且插件已用 SSE remount 替代 HMR，故 stub 掉 client 以避免控制台报错。
 * 保留 updateStyle/removeStyle，确保 dev 下 CSS 正常注入。
 */
export function devStubViteClientPlugin(): Plugin {
  return {
    name: 'cloud-plugin-uav-dev-stub-vite-client',
    apply: 'serve',
    configureServer(server) {
      attachStubMiddleware(server)
    },
  }
}
