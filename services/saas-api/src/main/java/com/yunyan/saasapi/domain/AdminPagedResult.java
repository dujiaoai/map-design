package com.yunyan.saasapi.domain;

import java.util.List;

public record AdminPagedResult<T>(List<T> items, long total) {}
