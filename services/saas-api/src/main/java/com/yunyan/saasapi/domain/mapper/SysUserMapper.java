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
}
