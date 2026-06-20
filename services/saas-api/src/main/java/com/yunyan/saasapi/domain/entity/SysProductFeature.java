package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_product_feature")
public class SysProductFeature {

  private UUID productId;
  private String code;
  private String name;
  private String description;
}
