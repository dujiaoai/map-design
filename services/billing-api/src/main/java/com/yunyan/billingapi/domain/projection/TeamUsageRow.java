package com.yunyan.billingapi.domain.projection;

import java.util.UUID;
import lombok.Data;

@Data
public class TeamUsageRow {

  private UUID userId;
  private Long totalPoints;
  private Long eventCount;
}
