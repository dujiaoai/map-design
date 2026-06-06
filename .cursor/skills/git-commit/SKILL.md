---
name: git-commit
description: >-
  Generate Conventional Commit messages from git status and diff in map-design.
  Use when the user asks to commit, write a commit message, or summarize staged
  changes—even if they say "帮我提交", "generate commit", or "写 commit 信息".
metadata:
  author: map-design
  version: "1.0.0"
compatibility: Requires git repository at map-design root. Node for generate script.
---

# Git Commit（map-design）

## 原则

- **仅在用户明确要求时**才执行 `git commit` / `git push`
- **禁止**改 git config、force push、跳过 hooks（除非用户明确要求）
- 提交信息：**Conventional Commits**（见 [CONTRIBUTING.md](../../docs/CONTRIBUTING.md)）

## 自动生成 commit 信息

```bash
node .cursor/skills/git-commit/scripts/generate-commit-message.mjs
node .cursor/skills/git-commit/scripts/generate-commit-message.mjs --staged
node .cursor/skills/git-commit/scripts/generate-commit-message.mjs --json
```

脚本根据**变更路径**推断 `type`、`scope`、subject，输出建议标题与文件列表。

路径 → scope 细则见 [references/scope-map.md](references/scope-map.md)。

## 标准工作流（用户要求提交时）

**并行**收集上下文：

```bash
git status
git diff
git diff --staged
git log -5 --format="%s"
```

1. 运行 `generate-commit-message.mjs`（优先 `--staged`）
2. 阅读 diff，修正脚本建议（why 优先于 what）
3. 确认不含 `.env`、密钥、token
4. `git add` 相关文件
5. 提交（见下方命令）
6. `git status` 验证

## 提交命令

**PowerShell（Windows）：**

```powershell
git commit -m "feat(saas-web): 简短说明"
# 多行 body：
git commit -m "feat(saas-web): 标题" -m "- 要点一`n- 要点二"
```

**Bash：**

```bash
git commit -m "$(cat <<'EOF'
feat(saas-web): 简短说明

- 要点
EOF
)"
```

## type 选用

| type | 何时 |
| --- | --- |
| `feat` | 新功能、新 UI 行为 |
| `fix` | Bug 修复 |
| `docs` | 仅文档 / Skill / ADR |
| `refactor` | 重构，无行为变化 |
| `test` | 仅测试 |
| `chore` | 工具、脚本、依赖、Cursor rules |
| `style` | 格式化、Biome，无逻辑变化 |

## scope 常用（map-design）

| scope | 路径 |
| --- | --- |
| `saas-web` | `apps/web/` |
| `ui` | `packages/ui/` |
| `auth` | `packages/auth/`、`shared/auth` |
| `map-workspace` | `features/map-workspace/` |
| `cloud-uav` | `cloud/uav/` |
| `skills` | `.cursor/skills/` |
| `docs` | `docs/` |

多 scope 时选**主要影响面**一个 scope；body 里列次要变更。

## 好 / 坏示例

```
✅ feat(saas-web): 快捷工具条支持拖拽与吸附
✅ docs(skills): 补充 git-commit 与 shadcn 优先规范
✅ fix(auth): 修复 bootstrap 401 后未清 session

❌ update files
❌ fix bug
❌ WIP
```

## 禁止

- 用户未要求时主动 `git commit`
- `git commit --amend` 除非用户明确要求且 HEAD 未 push
- 提交 secrets（`.env`、`credentials.json` 等）

## 验证

```bash
node .cursor/skills/scripts/validate-skills.mjs
node .cursor/skills/git-commit/scripts/generate-commit-message.mjs --staged
```
