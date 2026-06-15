package com.yunyan.saasapi.web.dto.internal;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record AckMembershipSyncEventsRequest(@NotEmpty List<String> eventIds) {}
