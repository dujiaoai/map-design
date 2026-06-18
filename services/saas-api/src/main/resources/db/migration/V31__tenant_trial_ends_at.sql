-- Phase 5C-1: 租户试用结束时间（平台生命周期）
ALTER TABLE sys_tenant ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE NULL;
