package com.yunyan.saasapi.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyan.saasapi.domain.entity.SysPermission;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysPermissionMapper extends BaseMapper<SysPermission> {

  @Select(
      """
      SELECT p.code
      FROM sys_permission p
      INNER JOIN sys_role_permission rp ON rp.permission_id = p.id
      WHERE rp.role_id = #{roleId}
      ORDER BY p.code
      """)
  List<String> selectCodesByRoleId(@Param("roleId") UUID roleId);

  @Select(
      """
      <script>
      SELECT DISTINCT p.code
      FROM sys_permission p
      INNER JOIN sys_role_permission rp ON rp.permission_id = p.id
      WHERE rp.role_id IN
      <foreach collection="roleIds" item="roleId" open="(" separator="," close=")">
        #{roleId}
      </foreach>
      ORDER BY p.code
      </script>
      """)
  List<String> selectCodesByRoleIds(@Param("roleIds") List<UUID> roleIds);
}
