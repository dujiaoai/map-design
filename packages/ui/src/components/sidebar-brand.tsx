"use client"

import * as React from "react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface SidebarBrandProps {
  logo: React.ReactNode
  title: string
  subtitle?: string
}

/** 侧栏静态品牌区（Logo + 平台名，不可点击切换） */
export function SidebarBrand({ logo, title, subtitle }: SidebarBrandProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="default"
          className={cn(
            'pointer-events-none cursor-default hover:bg-transparent active:bg-transparent',
            'group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!',
            'group-data-[collapsible=icon]:[&>div:not(:first-child)]:hidden',
          )}
          aria-label={title}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1 group-data-[collapsible=icon]:size-full group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:p-0.5">
            {logo}
          </div>
          <div className="grid min-w-0 flex-1 gap-0.5 pl-2 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground dark:text-brand">{title}</span>
            {subtitle ? (
              <span className="text-muted-foreground truncate text-xs">{subtitle}</span>
            ) : null}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
