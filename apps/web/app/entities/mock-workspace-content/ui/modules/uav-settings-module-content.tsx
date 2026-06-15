import { cn } from '@repo/ui'
import { BellIcon, MapIcon, Settings2Icon } from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const SETTING_TOGGLES = [
  { id: 'map-sync', label: '地图图层联动', description: '选中机库时在地图高亮范围', defaultOn: true },
  { id: 'live-alert', label: '直播异常提醒', description: '断流或低码率推送通知', defaultOn: true },
  { id: 'auto-reconnect', label: '自动重连', description: 'WebSocket 断开后重试', defaultOn: false },
] as const

export function UavSettingsModuleContent(_props: MockModuleContentProps) {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SETTING_TOGGLES.map((item) => [item.id, item.defaultOn])),
  )

  function toggle(id: string) {
    setToggles((current) => ({ ...current, [id]: !current[id] }))
  }

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="机库偏好">
        <ul className="space-y-2">
          {SETTING_TOGGLES.map((item) => (
            <li
              key={item.id}
              className="border-border rounded-lg border bg-background/60 p-3 dark:bg-black/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-xs">{item.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={toggles[item.id]}
                  onClick={() => toggle(item.id)}
                  className={cn(
                    'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                    toggles[item.id] ? 'bg-primary' : 'bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'bg-background absolute top-0.5 size-4 rounded-full shadow transition-transform',
                      toggles[item.id] ? 'translate-x-4' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </MockContentSection>

      <MockContentSection title="快捷操作">
        <div className="text-muted-foreground space-y-2 text-xs">
          <p className="flex items-center gap-1.5">
            <MapIcon className="size-3.5" aria-hidden />
            默认定位：杭州市
          </p>
          <p className="flex items-center gap-1.5">
            <BellIcon className="size-3.5" aria-hidden />
            通知渠道：工作台 + 邮件
          </p>
          <p className="flex items-center gap-1.5">
            <Settings2Icon className="size-3.5" aria-hidden />
            远程模块：cloud/uav ESM
          </p>
        </div>
      </MockContentSection>
    </div>
  )
}
