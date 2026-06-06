---
name: pm-sprint-planning
description: >-
  Plan engineering sprints for map-design frontend work. Use when the user asks for 迭代计划, sprint goal, capacity planning, backlog scoping for saas-web, or P0 vs stretch items with Definition of Done aligned to pnpm validate.
license: Apache-2.0
---


# /pm-sprint-planning


## map-design 上下文

规格与路线图须符合本 monorepo 约束。先读 [`map-design-product.md`](../saas-product/references/map-design-product.md)。

| 维度 | 说明 |
| --- | --- |
| 活跃 App | `@repo/saas-web` — 地图工作台 `/` |
| 占位 App | marketing、admin |
| 认证 | RuoYi 过渡 + `@repo/auth`（见 `docs/architecture/auth-rbac.md`） |
| 工作台 UI | 侧栏 / Dock / 快捷工具条 — `docs/architecture/map-workspace-ui.md` |
| 插件 | map-plugin-bridge、`cloud/uav` ESM |
| UI 组件 | shadcn 优先，唯一实例 `packages/ui` |

**产出**：PRD、研究合成、路线图等写入 `docs/product/`（按 `YYYY-MM-slug.md` 命名）。  
**工程落地**：规格定稿后改用 `/saas-fsd-feature`、`/map-workspace-ui`、`/repo-ui-package` 等实现 Skill。

> 本仓库未配置 Anthropic PM 插件的 MCP 连接器；上下文来自用户输入与 `docs/`、代码库，勿要求连接 Linear/Slack。

Plan a sprint by scoping work, estimating capacity, and setting clear goals.

## Usage

```
/pm-sprint-planning $ARGUMENTS
```

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPRINT PLANNING                                 │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Define sprint goals and success criteria                     │
│  ✓ Estimate team capacity (accounting for PTO, meetings)        │
│  ✓ Scope and prioritize backlog items                           │
│  ✓ Identify dependencies and risks                              │
│  ✓ Generate sprint plan document                                │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Project tracker: Pull backlog, create sprint, assign items   │
│  + Calendar: Account for PTO and meetings in capacity           │
│  + Chat: Share sprint plan with the team                        │
└─────────────────────────────────────────────────────────────────┘
```

## What I Need From You

- **Team**: Who's on the team and their availability this sprint?
- **Sprint length**: How many days/weeks?
- **Backlog**: What's prioritized? (Pull from tracker, paste, or describe)
- **Carryover**: Anything unfinished from last sprint?
- **Dependencies**: Anything blocked on other teams?

## Output

```markdown
## Sprint Plan: [Sprint Name]
**Dates:** [Start] — [End] | **Team:** [X] engineers
**Sprint Goal:** [One clear sentence about what success looks like]

### Capacity
| Person | Available Days | Allocation | Notes |
|--------|---------------|------------|-------|
| [Name] | [X] of [Y] | [X] points/hours | [PTO, on-call, etc.] |
| **Total** | **[X]** | **[X] points** | |

### Sprint Backlog
| Priority | Item | Estimate | Owner | Dependencies |
|----------|------|----------|-------|--------------|
| P0 | [Must ship] | [X] pts | [Person] | [None / Blocked by X] |
| P1 | [Should ship] | [X] pts | [Person] | [None] |
| P2 | [Stretch] | [X] pts | [Person] | [None] |

### Planned Capacity: [X] points | Sprint Load: [X] points ([X]% of capacity)

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [What happens] | [What to do] |

### Definition of Done
- [ ] Code reviewed and merged
- [ ] Tests passing
- [ ] Documentation updated (if applicable)
- [ ] Product sign-off

### Key Dates
| Date | Event |
|------|-------|
| [Date] | Sprint start |
| [Date] | Mid-sprint check-in |
| [Date] | Sprint end / Demo |
| [Date] | Retro |
```

## Tips

1. **Leave buffer** — Plan to 70-80% capacity. You will get interrupts.
2. **One clear sprint goal** — If you can't state it in one sentence, the sprint is unfocused.
3. **Identify stretch items** — Know what to cut if things take longer than expected.
4. **Carry over honestly** — If something didn't ship, understand why before re-committing.
