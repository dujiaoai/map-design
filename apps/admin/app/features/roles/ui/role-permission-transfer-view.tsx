import { Transfer } from 'antd'

import type { AdminPermission } from '~/shared/api/admin-api'

import {
  filterTransferItemsByQuery,
  permissionsToTransferItems,
} from '../lib/role-permission-transfer'

export function RolePermissionTransferView({
  permissions,
  selectedCodes,
  onSelectedCodesChange,
  readOnly = false,
}: {
  permissions: AdminPermission[]
  selectedCodes: string[]
  onSelectedCodesChange: (codes: string[]) => void
  readOnly?: boolean
}) {
  const dataSource = permissionsToTransferItems(permissions)

  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={selectedCodes}
      disabled={readOnly}
      showSearch
      filterOption={(input, item) => {
        const filtered = filterTransferItemsByQuery([item], input)
        return filtered.length > 0
      }}
      titles={['可选权限', '已选权限']}
      listStyle={{ flex: 1, width: '100%', height: 420 }}
      style={{ width: '100%' }}
      render={(item) => (
        <span className="min-w-0">
          <span className="block text-sm">{item.title}</span>
          <span className="block font-mono text-[10px] text-muted-foreground">{item.description}</span>
        </span>
      )}
      onChange={(nextTargetKeys) => onSelectedCodesChange(nextTargetKeys.map(String))}
      oneWay={false}
      pagination={{ pageSize: 20 }}
    />
  )
}
