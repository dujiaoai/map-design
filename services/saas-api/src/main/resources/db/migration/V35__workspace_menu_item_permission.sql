-- Phase 5E-2: 菜单项 RBAC permission 门控字段。
ALTER TABLE workspace_menu_item ADD COLUMN permission_code VARCHAR(128) NULL;
