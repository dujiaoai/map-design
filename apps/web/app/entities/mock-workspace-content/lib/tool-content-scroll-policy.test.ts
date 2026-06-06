import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const toolsDir = join(dirname(fileURLToPath(import.meta.url)), '../ui/tools')

const FORBIDDEN_OVERFLOW = /\boverflow-(?:y-auto|auto|scroll)\b/

describe('map tool content scroll policy', () => {
  it('mock tool panels must not declare their own overflow scroll', () => {
    const files = readdirSync(toolsDir).filter((name) => name.endsWith('.tsx'))

    for (const file of files) {
      const source = readFileSync(join(toolsDir, file), 'utf-8')
      expect(source, `${file} must use MapToolPanelBody scroll, not root overflow`).not.toMatch(
        FORBIDDEN_OVERFLOW,
      )
    }
  })
})
