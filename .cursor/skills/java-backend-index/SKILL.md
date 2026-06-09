---
name: java-backend-index
description: >-
  Java 后端 Skill 索引（map-design）。从零搭建 Spring Boot 3 REST 服务、对接前端
  @repo/api-client（/v1、Bearer JWT），覆盖脚手架、API 契约、鉴权 RBAC、持久化与测试。
  Use when 用户提到 Java 后端、Spring Boot、接口开发、微服务、从零搭服务、Maven 多模块；
  不涉及 RuoYi envelope 与 @repo/ruoyi-api。
---

# Java 后端 Skill 索引（map-design）

> **定位**：在 map-design monorepo 内从零搭建 **SaaS 目标后端**（`services/`），与前端 `@repo/api-client` 对接。  
> **排除**：`@repo/ruoyi-api`、RuoYi `{ code, msg, data }` envelope — 见 [ADR-0005](../../docs/adr/0005-ruoyi-transitional-backend.md)。

## 与前端契约

| 维度 | 目标后端 | 前端消费方 |
| --- | --- | --- |
| Base URL | `VITE_API_URL` → `/v1` | `@repo/api-client` |
| 认证 | Bearer access + refresh | `@repo/auth` refresh 回调 |
| 响应 | 标准 HTTP + JSON body | `ApiError(status, body)` |
| 多租户 | JWT `tenant_id` claim（默认） | `TenantProvider` / `X-Tenant-Id` 备选 |

详见 [backend-integration.md](../../docs/architecture/backend-integration.md)、[auth-rbac.md](../../docs/architecture/auth-rbac.md)、[multi-tenancy.md](../../docs/architecture/multi-tenancy.md)。

## 技术栈（默认）

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 运行时 | **Java 21 LTS** | 记录型类、虚拟线程可选 |
| 框架 | **Spring Boot 3.3+** | Web、Validation、Actuator |
| 构建 | **Maven** | 多模块 `services/pom.xml` 父 POM |
| 安全 | **Spring Security 6** + JWT | Resource Server 或自定义 Filter |
| ORM | **MyBatis-Plus 3.5** | 国内主流；复杂查询友好 |
| 数据库 | **PostgreSQL 16** | RLS + `tenant_id` 多租户 |
| 迁移 | **Flyway** | `db/migration/V*.sql` |
| 缓存 | **Redis** | 会话黑名单、限流、验证码 |
| API 文档 | **SpringDoc OpenAPI 3** | `/v3/api-docs`、Knife4j 可选 |
| 映射 | **MapStruct** + Lombok | DTO ↔ Entity |
| 测试 | JUnit 5 + Mockito + Testcontainers | 见 `java-backend-testing` |

## Skill 路由

| 任务 | Skill | 触发场景 |
| --- | --- | --- |
| 从零建工程、模块划分、本地跑通 | [java-spring-boot-scaffold](../java-spring-boot-scaffold/SKILL.md) | 「新建 Spring Boot」「services 目录」「Maven 多模块」 |
| REST 设计、错误体、OpenAPI、与 api-client 对齐 | [java-rest-api](../java-rest-api/SKILL.md) | 「写接口」「Controller」「/v1」「Swagger」 |
| JWT 登录、刷新、RBAC、租户隔离 | [java-auth-security](../java-auth-security/SKILL.md) | 「登录接口」「权限」「Spring Security」「多租户」 |
| 表设计、MyBatis-Plus、Flyway、RLS | [java-persistence](../java-persistence/SKILL.md) | 「建表」「Mapper」「数据库迁移」「tenant_id」 |
| 单元/集成测试、Testcontainers | [java-backend-testing](../java-backend-testing/SKILL.md) | 「写测试」「MockMvc」「集成测试」 |

## 推荐工作流（对齐 [services-development-plan.md](../../docs/architecture/services-development-plan.md)）

```
已完成：Sprint A/B（Auth MVP、租户 API、RLS）
已完成：Sprint C 后端 C-01～C-05 + 前端 C-06～C-08（登录/注册/bootstrap）
暂缓：C-09 侧栏 filterNavByTenant（菜单权限）

Sprint C 剩余（由你指定编号）：
  saas-auth-ruoyi → C-11 TeamSwitcher、C-12 RuoYi 清理

Sprint D（权限与后台）：
  java-persistence → sys_permission
  java-rest-api → /v1/admin/*
  saas-fsd-feature → apps/admin

Sprint E（Later）：业务域 API — C/D 不做

验证：mvn -pl saas-api test、pnpm smoke:saas-api
```

## 目录约定（规划）

```
map-design/
├── services/                    # Java 后端根（与 apps/、packages/ 并列）
│   ├── pom.xml                  # 父 POM（dependencyManagement）
│   ├── saas-api/                # 主 API 服务
│   │   ├── pom.xml
│   │   └── src/main/java/.../saasapi/
│   │       ├── config/
│   │       ├── web/             # Controller + advice
│   │       ├── domain/          # Entity + Repository(Mapper)
│   │       ├── application/     # Service + DTO
│   │       └── security/
│   └── docker-compose.dev.yml   # PG + Redis 本地依赖
├── apps/web/                    # 前端（不变）
└── packages/api-client/         # 对接目标
```

包名建议：`com.yunyan.saas` 或 `com.haoxuan.saas`（与组织域名一致）。

## 与其它 Skill 协作

| 场景 | 协作 Skill |
| --- | --- |
| 前端接通新 API | `saas-fsd-feature` → `shared/queries/` + `api-client` |
| Sprint C/D 会话与后台 | [services-development-plan.md](../../docs/architecture/services-development-plan.md) §十 + `java-auth-security` + `saas-auth-ruoyi` |
| Docker 全栈部署 | `docker-deploy`（后续扩展 compose 含 saas-api） |
| PRD / 接口清单 | `pm-write-spec` → `docs/product/` |

## Agent 原则

1. **先读索引再动手**：按上表路由到子 Skill，避免在 Controller 里堆安全/持久化细节。
2. **契约优先**：改接口前对照 `java-rest-api` 与 `@repo/api-client` 错误语义。
3. **租户与安全不可后补**：新表带 `tenant_id`；写操作经 SecurityContext 校验。
4. **验证命令**：`mvn -pl saas-api test`、`-Dspring-boot.run.profiles=dev` 本地启动。
