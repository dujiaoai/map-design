package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("workspace_menu_item")
public class WorkspaceMenuItem {

  @TableId
  private String id;

  private String sectionId;

  private String title;

  private String kind;

  private String icon;

  private String toolId;

  private String moduleId;

  private String url;

  private String href;

  private String tenantFeature;

  /** RBAC permission 门控（Phase 5E-2） */
  private String permissionCode;

  private Integer sortOrder;

  private Boolean enabled;
}
