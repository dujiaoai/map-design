package com.yunyan.saasapi.domain.mapper;

import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysAdminAuditLogMapper extends BaseMapper<SysAdminAuditLog> {

  @InterceptorIgnore(tenantLine = "true")
  @Select(
      "SELECT COUNT(*) FROM sys_admin_audit_log WHERE created_at >= #{from} AND created_at < #{to}")
  long countCreatedBetween(@Param("from") java.time.Instant from, @Param("to") java.time.Instant to);
}
