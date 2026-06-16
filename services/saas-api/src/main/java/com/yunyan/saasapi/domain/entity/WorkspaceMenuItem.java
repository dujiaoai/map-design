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

  private Integer sortOrder;

  private Boolean enabled;
}
