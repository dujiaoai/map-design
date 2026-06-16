import { Tabs, TabsList, TabsTrigger, cn } from '@repo/ui'

import {
  BILLING_GROUP_DEFS,
  BILLING_TAB_LABELS,
  type BillingGroup,
  type BillingTab,
  type BillingTabVisibility,
  listVisibleBillingGroups,
  listVisibleTabsInGroup,
  resolveBillingGroup,
} from '~/features/billing/lib/billing-admin-nav'

type BillingTabNavProps = {
  activeTab: BillingTab
  visibility: BillingTabVisibility
  onSelectTab: (tab: BillingTab) => void
}

export function BillingTabNav({ activeTab, visibility, onSelectTab }: BillingTabNavProps) {
  const visibleGroups = listVisibleBillingGroups(visibility)
  const activeGroup = resolveBillingGroup(activeTab)
  const subTabs = listVisibleTabsInGroup(activeGroup, visibility)
  const showSubTabs = activeGroup !== 'overview' && subTabs.length > 1

  function selectGroup(group: BillingGroup) {
    const tabs = listVisibleTabsInGroup(group, visibility)
    const next = tabs[0]
    if (next) onSelectTab(next)
  }

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap gap-1 rounded-lg border border-border/80 bg-card/60 p-1"
        role="tablist"
        aria-label="计费分组"
      >
        {BILLING_GROUP_DEFS.filter((group) => visibleGroups.includes(group.id)).map((group) => {
          const isActive = activeGroup === group.id
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              onClick={() => selectGroup(group.id)}
            >
              {group.label}
            </button>
          )
        })}
      </div>

      {showSubTabs ? (
        <Tabs value={activeTab} onValueChange={(value) => onSelectTab(value as BillingTab)}>
          <TabsList className="h-auto flex-wrap">
            {subTabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {BILLING_TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}
    </div>
  )
}
