package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.SysAdminAuditLog;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysAdminAuditLogMapper {

  @Insert(
      """
      INSERT INTO sys_admin_audit_log (
          id, actor_user_id, actor_email, actor_tenant_id, action, resource_type,
          resource_id, target_tenant_id, cross_tenant, detail, created_at
      ) VALUES (
          #{id}, #{actorUserId}, #{actorEmail}, #{actorTenantId}, #{action}, #{resourceType},
          #{resourceId}, #{targetTenantId}, #{crossTenant}, #{detail}, #{createdAt}
      )
      """)
  void insert(SysAdminAuditLog log);

  @Select("SELECT COUNT(*) FROM sys_admin_audit_log WHERE action = #{action}")
  long countByAction(@Param("action") String action);
}
