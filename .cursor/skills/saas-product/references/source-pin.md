# Anthropic PM Plugin 来源

| 字段 | 值 |
| --- | --- |
| 上游仓库 | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) |
| 路径 | `product-management/skills/` |
| 许可证 | Apache-2.0 |
| 本地化目录 | `.cursor/skills/pm-*` |
| 同步脚本 | `.cursor/skills/scripts/sync-pm-skills.mjs` |
| Vendor 缓存 | `.cursor/_vendor/knowledge-work-plugins/`（可删后重新 sparse clone） |

## 本地化改动（相对上游）

1. **description** 增加 map-design / 中文触发词  
2. 注入 **map-design 上下文**（链到 `map-design-product.md`）  
3. 移除 MCP **CONNECTORS** 依赖，改为 `docs/` + 代码库  
4. 命令前缀 **`/pm-*`**，避免与 Cursor 其他 skill 冲突  
5. 产出约定 **`docs/product/`**  
6. 编排 Skill **`saas-product`** 串联工程 handoff  

## 再拉取上游

```powershell
git -C .cursor/_vendor/knowledge-work-plugins pull
node .cursor/skills/scripts/sync-pm-skills.mjs
```

若 vendor 不存在：

```powershell
git clone --depth 1 --filter=blob:none --sparse `
  https://github.com/anthropics/knowledge-work-plugins.git `
  .cursor/_vendor/knowledge-work-plugins
Set-Location .cursor/_vendor/knowledge-work-plugins
git sparse-checkout set product-management
Set-Location ../../..
node .cursor/skills/scripts/sync-pm-skills.mjs
```
