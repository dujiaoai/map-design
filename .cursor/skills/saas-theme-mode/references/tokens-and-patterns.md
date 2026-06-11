# 主题 Token 与写法参考

## CSS 变量（`packages/ui/src/styles/globals.css`）

### 品牌（`:root` 共用，不随模式翻转）

| 变量 | 典型用途 |
| --- | --- |
| `--brand` | 主色 `#3094ff` → Tailwind `bg-primary` / `text-brand` |
| `--brand-light` | 强调、激活态文字 |
| `--brand-deep` | 深色下品牌强调字 |
| `--brand-soft` | 暗色模式柔和品牌字 |
| `--brand-muted` / `--brand-glow` | 光晕、选中背景 |

### 指挥舱表面（`:root` 定义，暗色语义为主）

| 变量 | 用途 |
| --- | --- |
| `--surface-deep` | 工作台页背景基底 |
| `--surface-panel` | 面板、`.dark` 下 `--background` |
| `--surface-elevated` | 登录输入框等抬升表面 |
| `--text-on-dark` | 暗色主文字 |

### 语义 Token（`.dark` 生效）

| Tailwind | 含义 |
| --- | --- |
| `bg-background` / `text-foreground` | 页面底与主字 |
| `bg-card` / `bg-popover` | 卡片、菜单 |
| `text-muted-foreground` | 次要文字 |
| `bg-muted` / `bg-accent` | 悬停、次级底 |
| `border-border` | 边框 |
| `bg-sidebar` / `sidebar-*` | 侧栏（globals 内暗色增强） |

## 推荐 class 组合

### 通用控件

```tsx
// 默认：语义 token 即可
<div className="rounded-lg border border-border bg-background text-foreground" />

// 次要文字
<p className="text-muted-foreground" />

// 悬停按钮
<button className="text-muted-foreground hover:bg-accent hover:text-foreground" />
```

### 工作台 chrome（玻璃 / 高对比）

```tsx
import { WORKSPACE_CHROME_ICON_BUTTON_CLASS } from '~/shared/lib/workspace-chrome-styles'

// 或等价写法：
'hover:bg-accent hover:text-foreground dark:text-white/65 dark:hover:bg-white/8 dark:hover:text-white'
```

### 边框 / 输入（细线暗色）

```tsx
'border-border dark:border-white/10'
'bg-muted/40 dark:bg-white/5'
'placeholder:text-muted-foreground dark:placeholder:text-white/35'
```

### 激活 / 品牌高亮

```tsx
'bg-primary/20 text-brand-deep dark:text-brand-light'
'border-primary bg-primary/10 text-brand-light'
```

## 页面级（工作台暗色）

`home.css` 使用 **`html.dark .workspace-page`** 定义指挥舱布局与 HUD。

新增工作台大块 UI 时：

1. 默认用 `--surface-deep` / `--text-on-dark`
2. 在 `home.css` 增加对应 `html.dark …` 规则（背景、边框、HUD、status-bar 等已有示例）

## `@repo/ui` 全局暗色增强

已在 `globals.css` `@layer base`：

- `[data-sidebar='sidebar']` — 侧栏毛玻璃
- `[data-slot='drawer-content']` 等 — 浮层 cc-glass
- `[data-slot='card']` — 卡片边框光晕

新 **通用** 暗色 primitive 样式加在此处；一次性页面样式放 app CSS。

## cloud/uav

同样 import `@repo/ui` globals；挂载根 `.yunyan-cloud-uav`。遵循 **`saas-theme-mode`** 语义 token + `dark:`。

## 反例

```tsx
// ❌ 仅深色有效
<div className="bg-[#0b1528] text-white" />

// ✅
<div className="bg-background text-foreground" />

// ❌ 硬编码品牌色
<span className="text-[#3094ff]" />

// ✅
<span className="text-primary" />
```
