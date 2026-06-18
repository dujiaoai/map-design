package com.yunyan.saasapi.domain.mapper;

import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyan.saasapi.domain.entity.SysUser;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

  /** 跨租户成员查询：列出同一邮箱在所有租户下的活跃账号。 */
  @InterceptorIgnore(tenantLine = "true")
  @Select(
      "SELECT * FROM sys_user WHERE email = #{email} AND status = 'active' ORDER BY tenant_id")
  List<SysUser> selectActiveByEmailAcrossTenants(@Param("email") String email);

  @InterceptorIgnore(tenantLine = "true")
  @Select("SELECT COUNT(*) FROM sys_user WHERE created_at >= #{since}")
  long countUsersCreatedSince(@Param("since") java.time.Instant since);

  /** 近 N 日至少一名成员登录过的租户数（distinct tenant_id）。 */
  @InterceptorIgnore(tenantLine = "true")
  @Select(
      "SELECT COUNT(DISTINCT tenant_id) FROM sys_user WHERE last_login_at IS NOT NULL AND last_login_at >= #{since}")
  long countDistinctTenantsWithLoginSince(@Param("since") java.time.Instant since);

  @InterceptorIgnore(tenantLine = "true")
  @Select(
      "SELECT COUNT(*) FROM sys_user WHERE created_at >= #{from} AND created_at < #{to}")
  long countUsersCreatedBetween(
      @Param("from") java.time.Instant from, @Param("to") java.time.Instant to);

  @InterceptorIgnore(tenantLine = "true")
  @Select(
      "SELECT COUNT(DISTINCT tenant_id) FROM sys_user WHERE last_login_at >= #{from} AND last_login_at < #{to}")
  long countActiveTenantsBetween(
      @Param("from") java.time.Instant from, @Param("to") java.time.Instant to);
}
