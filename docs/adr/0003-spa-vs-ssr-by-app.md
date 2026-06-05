# ADR-0003: 各 App 渲染模式

## Status

Accepted

## Context

Web/Admin 为登录后应用，SEO 需求低；Marketing 需搜索引擎可见。

## Decision

| App | 模式 |
| --- | --- |
| Web | SPA（`ssr: false`） |
| Admin | SPA（`ssr: false`） |
| Marketing | SSG 或 SSR（待实现时选定） |

## Consequences

- Web/Admin 静态部署，Nginx `try_files` fallback
- 数据层使用 `clientLoader` / `clientAction`
- Marketing 可后续单独启用 SSR 而不影响 Web
