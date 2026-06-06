#!/usr/bin/env node
import { execSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "../../../../")
const args = new Set(process.argv.slice(2))
const stagedOnly = args.has("--staged")
const asJson = args.has("--json")

function safeGit(cmd, fallback = "") {
  try { return execSync(cmd, { cwd: repoRoot, encoding: "utf8" }).trim() } catch { return fallback }
}

function parseStatus(porcelain) {
  if (!porcelain) return []
  return porcelain.split("\n").filter(Boolean).map((line) => {
    const xy = line.slice(0, 2)
    const file = line.slice(3).replace(/^"|"$/g, "")
    return { xy, file, staged: xy[0] !== " " && xy[0] !== "?" }
  })
}

function scopeForPath(path) {
  if (path.startsWith("apps/web/app/features/map-workspace/")) return "map-workspace"
  if (path.startsWith("apps/web/")) return "saas-web"
  if (path.startsWith("packages/ui/")) return "ui"
  if (path.startsWith("packages/auth/")) return "auth"
  if (path.startsWith("packages/ruoyi-api/")) return "ruoyi-api"
  if (path.startsWith("packages/api-client/")) return "api-client"
  if (path.startsWith("cloud/uav/")) return "cloud-uav"
  if (path.startsWith(".cursor/skills/")) return "skills"
  if (path.startsWith(".cursor/rules/")) return "cursor"
  if (path.startsWith("docs/adr/")) return "adr"
  if (path.startsWith("docs/")) return "docs"
  if (path.startsWith("packages/")) return "packages"
  return "repo"
}

function typeForChanges(files, diff) {
  if (files.every((f) => f.includes(".test."))) return "test"
  if (files.every((f) => f.endsWith(".md") || f.startsWith("docs/") || f.startsWith(".cursor/skills/"))) return "docs"
  if (/\bfix(ed|es|ing)?\b|bug|broken/i.test(diff)) return "fix"
  if (/\brefactor\b/i.test(diff) && !/add|new|feat/i.test(diff)) return "refactor"
  return "feat"
}

function subjectForChanges(files, type) {
  if (files.some((f) => f.includes("git-commit"))) return "add git-commit skill and message generator"
  if (files.some((f) => f.includes(".cursor/skills"))) return "update Cursor agent skills"
  if (files.some((f) => f.includes("map-workspace"))) return "update map workspace UI"
  if (type === "docs") return "update project documentation"
  if (type === "test") return "add or update unit tests"
  if (type === "fix") return "fix issue in changed modules"
  return "update changed modules"
}

function pickScope(scopes) {
  for (const s of ["saas-web", "map-workspace", "ui", "auth", "cloud-uav", "skills", "docs", "repo"]) {
    if (scopes.has(s)) return s
  }
  return [...scopes][0] ?? "repo"
}

const entries = parseStatus(safeGit("git status --porcelain"))
if (!entries.length) { console.log("Working tree clean."); process.exit(0) }
const stagedEntries = entries.filter((e) => e.staged)
const targetEntries = stagedOnly || stagedEntries.length ? stagedEntries : entries
const files = targetEntries.map((e) => e.file)
const diff = safeGit(stagedEntries.length || stagedOnly ? "git diff --staged --no-color" : "git diff --no-color", "")
const scopes = new Set(files.map(scopeForPath))
const type = typeForChanges(files, diff)
const headline = `${type}(${pickScope(scopes)}): ${subjectForChanges(files, type)}`
const bodyLines = files.slice(0, 8).map((f) => `- ${f}`)
if (asJson) { console.log(JSON.stringify({ headline, type, scopes: [...scopes], files, body: bodyLines.join("\n") }, null, 2)); process.exit(0) }
console.log("Suggested commit\n\n" + headline + "\n\n" + bodyLines.join("\n") + `\n\ngit commit -m "${headline.replace(/"/g, '\\"')}"`)
