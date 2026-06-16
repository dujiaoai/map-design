package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("workspace_menu_section")
public class WorkspaceMenuSection {

  @TableId
  private String id;

  private String label;

  private Boolean collapsible;

  private Boolean defaultOpen;

  private String storageKey;

  private Integer sortOrder;

  private Boolean enabled;
}
