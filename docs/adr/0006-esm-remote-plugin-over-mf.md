# ADR-0006: Cloud 模块采用 ESM Remote Plugin 而非 Module Federation

## Status

Accepted

## Context

`@repo/cloud-uav` 需要在 Vue 宿主（`yunyan-web`）中嵌入 React 业务 UI（机库管控）。候选方案：

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| **Module Federation** | 共享依赖、生态成熟 | Vite dev 无法 bundleless 暴露 remoteEntry；需 build --watch + preview |
| **iframe** | 完全隔离 | 通信复杂、Cookie/样式隔离问题 |
| **ESM Remote Plugin** | 原生 import()、dev 可 Virtual entry、契约简单 | 不共享 React runtime、需自研 mount/unmount |

Vite 官方与 MF 维护者均指出：remote 侧在 dev 无法像 host 一样纯 bundleless 暴露打包入口。

## Decision

采用 **轻量 ESM Remote Plugin** 模式：

1. 生产：`vite build` 多入口 lib 模式，产出 `assets/registry.js` + `assets/{moduleId}.js`
2. 开发：`vite-plugin-dev-remote-entry` 将 URL 映射到源码入口，单 Vite dev server 即可
3. 契约：`mount(container)` / `unmount(container)` / `reload?(container)`（dev 热更新）
4. 宿主通过 `import('/yunyan-cloud-uav/assets/registry.js')` → `loadModule(id)` → `mount`
5. 不引入 `@module-federation/vite` 或类似运行时

## Consequences

### 正面

- dev 体验好：改 TSX 后 SSE 通知宿主 remount，无需 build --watch
- 部署简单：静态 ESM + nginx，无 MF runtime
- 版本独立：SemVer + registry 清单

### 负面

- React 不共享（插件 bundle 含 React），体积较大
- 需自研 dev 插件（remote-entry、reload、stub-client）
- 与 saas-web 内 Map Tool Plugin 是不同集成模式，需文档区分

## 参考

- [cloud/uav/README.md](../../cloud/uav/README.md)
- [map-plugin-integration.md](../architecture/map-plugin-integration.md)
