---
name: java-persistence
description: >-
  Java 持久化：PostgreSQL + MyBatis-Plus + Flyway 迁移、tenant_id 多租户列、Entity/Mapper
  规范、分页与乐观锁。Use when 用户建表、写 Mapper、数据库迁移、RLS，或提到 MyBatis、JPA、
  Flyway、SQL、tenant_id、数据库设计。
---

# 持久化（PostgreSQL + MyBatis-Plus + Flyway）

## 技术选型说明

| 选项 | 本项目默认 | 理由 |
| --- | --- | --- |
| ORM | **MyBatis-Plus 3.5** | 国内主流、SQL 可控、多租户插件成熟 |
| 数据库 | **PostgreSQL 16** | 支持 RLS、JSONB、地理扩展 |
| 迁移 | **Flyway** | 版本化 SQL，与 Spring Boot 原生集成 |
| 连接池 | HikariCP（Boot 默认） | — |

若团队更熟 JPA：可换 `spring-boot-starter-data-jpa`，但需同步改 tenant 拦截策略；**默认坚持 MyBatis-Plus**。

## Flyway 约定

路径：`saas-api/src/main/resources/db/migration/`

```
V1__baseline.sql
V2__auth_tables.sql
V3__seed_roles.sql
V6__permissions.sql
V7__tenant_status.sql
```

规则：

- 文件名 `V{version}__{description}.sql`，版本单调递增
- **禁止**修改已应用迁移；纠错用新 `V{n+1}__fix_xxx.sql`
- 本地：`spring.flyway.baseline-on-migrate=true` 仅首次

## 基线表（认证 + 租户）

```sql
-- V2__auth_tables.sql（摘录）
CREATE TABLE sys_tenant (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(128) NOT NULL,
  slug        VARCHAR(64)  NOT NULL UNIQUE,
  plan        VARCHAR(32)  NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE sys_user (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES sys_tenant(id),
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(128),
  status        VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE sys_role (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) NOT NULL UNIQUE  -- PLATFORM_ADMIN, TENANT_ADMIN, ...
);

CREATE TABLE sys_user_role (
  user_id UUID NOT NULL REFERENCES sys_user(id),
  role_id UUID NOT NULL REFERENCES sys_role(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_sys_user_tenant ON sys_user(tenant_id);
```

## 多租户列约定

凡租户归属业务表 **必须** 含：

```sql
tenant_id UUID NOT NULL REFERENCES sys_tenant(id),
```

配合 [multi-tenancy.md](../../docs/architecture/multi-tenancy.md)：

- 应用层：MyBatis-Plus `TenantLineInnerInterceptor`
- 数据库层（可选加强）：PostgreSQL RLS

```sql
ALTER TABLE sys_user ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON sys_user
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

RLS 需在连接池设置 `app.tenant_id`（`ConnectionInitializer` 或 `@Transactional` 钩子）。

## Entity 规范

```java
@Data
@TableName("sys_user")
public class SysUser {
  @TableId(type = IdType.ASSIGN_UUID)
  private UUID id;
  private UUID tenantId;
  private String email;
  private String passwordHash;
  private String displayName;
  private String status;
  private Instant createdAt;
}
```

- 主键：**UUID**（与 API 路径参数一致）
- 时间：`Instant` / `OffsetDateTime`，DB 用 `TIMESTAMPTZ`
- 软删（可选）：`@TableLogic` + `deleted_at`

## Mapper 规范

```java
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
  // 复杂查询才写 XML；简单 CRUD 用 BaseMapper + LambdaQueryWrapper
}
```

```java
// Service 内查询
var user = userMapper.selectOne(
    Wrappers.<SysUser>lambdaQuery()
        .eq(SysUser::getTenantId, TenantContext.require())
        .eq(SysUser::getEmail, email));
```

**禁止**在 Controller 注入 Mapper。

## MyBatis-Plus 配置要点

```java
@Configuration
@MapperScan("com.yunyan.saasapi.domain.mapper")
public class MybatisPlusConfig {

  @Bean
  MybatisPlusInterceptor mybatisPlusInterceptor(TenantLineHandler tenantHandler) {
    var interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(tenantHandler));
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.POSTGRE_SQL));
    return interceptor;
  }
}
```

分页：Service 返回 `IPage<Entity>` → MapStruct 转 `PageResponse<Dto>`（见 java-rest-api）。

## 事务

- 写操作：`@Transactional` 标在 **Service** 实现类
- 只读查询：`@Transactional(readOnly = true)` 可选
- 跨 Mapper 同一用例：单 Service 方法内完成

## 本地开发

```bash
docker compose -f services/docker-compose.dev.yml up -d postgres
cd services/saas-api && mvn flyway:migrate   # 或靠 Boot 启动自动迁移
```

## 工作流检查清单

```
- [ ] 新表含 tenant_id（平台级表除外）
- [ ] Flyway 版本号未冲突
- [ ] Entity 字段与 migration 一致
- [ ] Mapper 不泄漏到 web 层
- [ ] 租户拦截器对业务表生效
- [ ] Testcontainers 集成测试能跑迁移（java-backend-testing）
```

## 相关 Skill

| 场景 | Skill |
| --- | --- |
| 鉴权用表 | `java-auth-security` |
| 暴露 CRUD API | `java-rest-api` |
| 工程初始化 | `java-spring-boot-scaffold` |
