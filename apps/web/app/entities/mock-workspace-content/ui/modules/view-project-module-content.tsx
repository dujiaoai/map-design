import { Badge, Button } from '@repo/ui'
import { BriefcaseIcon, ChevronRightIcon } from 'lucide-react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: '西湖景区巡检',
    region: '杭州市 · 西湖区',
    status: '进行中',
    flights: 128,
  },
  {
    id: 'p2',
    name: '钱江新城正射更新',
    region: '杭州市 · 上城区',
    status: '待复核',
    flights: 42,
  },
  {
    id: 'p3',
    name: '高速 G25 段预警',
    region: '湖州市 · 德清县',
    status: '已归档',
    flights: 356,
  },
] as const

export function ViewProjectModuleContent(_props: MockModuleContentProps) {
  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="项目列表">
        <ul className="space-y-2">
          {MOCK_PROJECTS.map((project) => (
            <li
              key={project.id}
              className="border-border hover:border-primary/30 group flex items-center gap-3 rounded-lg border bg-background/60 p-3 transition-colors dark:bg-black/20"
            >
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                <BriefcaseIcon className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate font-medium">{project.name}</p>
                <p className="text-muted-foreground truncate text-xs">{project.region}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="secondary" className="text-[10px]">
                  {project.status}
                </Badge>
                <span className="text-muted-foreground text-[10px]">{project.flights} 架次</span>
              </div>
              <ChevronRightIcon
                className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="mt-3 w-full" type="button">
          查看全部项目
        </Button>
      </MockContentSection>
    </div>
  )
}
