import { Badge, Button, cn } from '@repo/ui'
import {
  CheckCircle2Icon,
  FileIcon,
  FileUpIcon,
  LayersIcon,
  Loader2Icon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'

import type { MockDrawerToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'

type ImportStatus = 'ready' | 'importing' | 'done' | 'error'

interface ImportJob {
  id: string
  fileName: string
  format: string
  size: string
  status: ImportStatus
  featureCount?: number
}

const FORMAT_OPTIONS = ['GeoJSON', 'KML', 'Shapefile', 'CSV 坐标'] as const

const MOCK_RECENT: ImportJob[] = [
  {
    id: 'r1',
    fileName: '西湖巡检范围.geojson',
    format: 'GeoJSON',
    size: '248 KB',
    status: 'done',
    featureCount: 12,
  },
  {
    id: 'r2',
    fileName: '机库缓冲区.kml',
    format: 'KML',
    size: '86 KB',
    status: 'done',
    featureCount: 3,
  },
]

const TARGET_LAYERS = ['目录标绘层', '临时导入层', '业务专题层'] as const

export function ImportFileDrawerContent(_props: MockDrawerToolContentProps) {
  const [selectedFormat, setSelectedFormat] = useState<(typeof FORMAT_OPTIONS)[number]>('GeoJSON')
  const [targetLayer, setTargetLayer] = useState<(typeof TARGET_LAYERS)[number]>('目录标绘层')
  const [jobs, setJobs] = useState<ImportJob[]>(MOCK_RECENT)
  const [dragOver, setDragOver] = useState(false)

  function simulateImport() {
    const id = `job-${Date.now()}`
    setJobs((current) => [
      {
        id,
        fileName: `演示导入_${selectedFormat.toLowerCase()}.${selectedFormat === 'Shapefile' ? 'zip' : 'geojson'}`,
        format: selectedFormat,
        size: '—',
        status: 'importing',
      },
      ...current,
    ])
    window.setTimeout(() => {
      setJobs((current) =>
        current.map((job) =>
          job.id === id
            ? { ...job, status: 'done', size: '128 KB', featureCount: 8 }
            : job,
        ),
      )
    }, 1200)
  }

  function removeJob(jobId: string) {
    setJobs((current) => current.filter((job) => job.id !== jobId))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm">
      <p className="text-muted-foreground text-xs leading-relaxed">
        地图区域保持可操作；导入的矢量将叠加至选定目录标绘层。演示 mock，不实际上传文件。
      </p>

      <MockContentSection title="上传文件">
        <div
          className={cn(
            'border-border flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors',
            dragOver ? 'border-primary/50 bg-primary/5' : 'bg-muted/20 dark:bg-black/15',
          )}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            simulateImport()
          }}
        >
          <FileUpIcon className="text-muted-foreground size-8" aria-hidden />
          <p className="text-foreground text-sm font-medium">拖拽文件到此处</p>
          <p className="text-muted-foreground text-xs">或点击下方按钮模拟导入</p>
          <Button type="button" size="sm" className="mt-1 gap-1.5" onClick={simulateImport}>
            <FileUpIcon className="size-3.5" aria-hidden />
            选择文件
          </Button>
        </div>
      </MockContentSection>

      <MockContentSection title="格式">
        <div className="flex flex-wrap gap-1.5">
          {FORMAT_OPTIONS.map((format) => (
            <button
              key={format}
              type="button"
              aria-pressed={selectedFormat === format}
              onClick={() => setSelectedFormat(format)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                selectedFormat === format
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {format}
            </button>
          ))}
        </div>
      </MockContentSection>

      <MockContentSection title="目标图层">
        <div className="border-border rounded-lg border bg-muted/20 p-2 dark:bg-black/15">
          <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
            <LayersIcon className="size-3.5" aria-hidden />
            导入后写入
          </div>
          <ul className="space-y-1">
            {TARGET_LAYERS.map((layer) => (
              <li key={layer}>
                <button
                  type="button"
                  onClick={() => setTargetLayer(layer)}
                  className={cn(
                    'flex w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                    targetLayer === layer
                      ? 'bg-primary/10 text-foreground font-medium'
                      : 'hover:bg-muted/40 text-muted-foreground',
                  )}
                >
                  {layer}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </MockContentSection>

      <MockContentSection title="导入记录">
        {jobs.length > 0 ? (
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="border-border flex items-start gap-2 rounded-lg border bg-background/60 p-3 dark:bg-black/20"
              >
                <FileIcon className="text-brand-light mt-0.5 size-4 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate font-medium">{job.fileName}</p>
                  <p className="text-muted-foreground text-xs">
                    {job.format} · {job.size}
                    {job.featureCount != null ? ` · ${job.featureCount} 要素` : ''}
                  </p>
                </div>
                {job.status === 'importing' ? (
                  <Loader2Icon className="text-primary size-4 shrink-0 animate-spin" aria-hidden />
                ) : job.status === 'done' ? (
                  <CheckCircle2Icon
                    className="size-4 shrink-0 text-emerald-500"
                    aria-label="导入完成"
                  />
                ) : null}
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {targetLayer}
                </Badge>
                <button
                  type="button"
                  aria-label="移除记录"
                  onClick={() => removeJob(job.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0 rounded p-0.5"
                >
                  <Trash2Icon className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-xs">暂无导入记录</p>
        )}
      </MockContentSection>
    </div>
  )
}
