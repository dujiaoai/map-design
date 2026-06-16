import { Modal, type ModalProps } from 'antd'
import { cn } from '@repo/ui'

export type AdminAntModalProps = ModalProps

export function AdminAntModal({
  className,
  destroyOnHidden = true,
  centered = true,
  ...props
}: AdminAntModalProps) {
  return (
    <Modal
      {...props}
      centered={centered}
      destroyOnHidden={destroyOnHidden}
      className={cn('admin-ant-modal', className)}
    />
  )
}
