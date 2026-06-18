package com.yunyan.saasapi.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyan.saasapi.domain.entity.ScimSyncCursor;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ScimSyncCursorMapper extends BaseMapper<ScimSyncCursor> {}
