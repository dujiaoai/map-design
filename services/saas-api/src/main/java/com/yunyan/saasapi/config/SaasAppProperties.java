package com.yunyan.saasapi.config;

import java.time.Duration;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "saas")
public class SaasAppProperties {

  private final Mail mail = new Mail();
  private final App app = new App();
  private final Auth auth = new Auth();
  private final Invite invite = new Invite();
  private final PasswordReset passwordReset = new PasswordReset();
  private final Registration registration = new Registration();
  private final RateLimit rateLimit = new RateLimit();
  private final Audit audit = new Audit();
  private final ObjectStorage objectStorage = new ObjectStorage();

  @Data
  public static class Mail {
    private boolean enabled = true;
    private String from = "noreply@yunyan.local";
  }

  @Data
  public static class App {
    private String webBaseUrl = "http://localhost:5175";
    private String adminBaseUrl = "http://localhost:5181";
  }

  @Data
  public static class Auth {
    private final Password password = new Password();
    private final AdminMfa adminMfa = new AdminMfa();
    private final OAuth2 oauth2 = new OAuth2();
  }

  @Data
  public static class OAuth2 {
    private boolean enabled = false;
    private java.util.List<OAuth2Provider> providers = new java.util.ArrayList<>();
  }

  @Data
  public static class OAuth2Provider {
    private String id;
    private String displayName;
    private String issuerUri;
    private String clientId;
    private String clientSecret = "";
    private java.util.List<String> scopes =
        java.util.List.of("openid", "profile", "email");
  }

  @Data
  public static class AdminMfa {
    /** 为 true 时平台管理员须完成 TOTP（Phase 2 登录 step-up） */
    private boolean enforcementEnabled = false;
    /** AES-256 密钥（Base64，32 字节）用于加密 TOTP secret */
    private String secretEncryptionKey = "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=";
    /** otpauth URI issuer */
    private String totpIssuer = "YunYan Admin";
  }

  @Data
  public static class Password {
    /** 新密码须含大小写字母与数字（不影响已有 password 登录） */
    private boolean strengthEnabled = false;
  }

  @Data
  public static class Invite {
    private Duration tokenTtl = Duration.ofHours(48);
    /** 可分享邀请链接默认有效期；为零或未配置表示不过期 */
    private Duration linkDefaultTtl = Duration.ofDays(7);
    private String tokenPepper = "dev-invite-pepper-change-me!!";
  }

  @Data
  public static class PasswordReset {
    private Duration tokenTtl = Duration.ofHours(1);
  }

  @Data
  public static class Registration {
    private Duration tokenTtl = Duration.ofHours(24);
    /** 允许 POST /v1/auth/register-org 自助创建租户 */
    private boolean allowPublicOrgSignup = true;
    /** 允许 POST /v1/auth/register-personal 自助注册个人版 */
    private boolean allowPublicPersonalSignup = true;
  }

  @Data
  public static class RateLimit {
    private boolean enabled = true;
    private LoginRateLimit login = new LoginRateLimit();
    private ThrottledEmailEndpoint register = new ThrottledEmailEndpoint();
    private ThrottledEmailEndpoint passwordReset = new ThrottledEmailEndpoint();
    private TenantApiRateLimit tenantApi = new TenantApiRateLimit();
  }

  @Data
  public static class TenantApiRateLimit {
    /** 对已认证 /v1/** 请求按租户 plan 限流 */
    private boolean enabled = true;
    private Duration window = Duration.ofMinutes(1);
    /** 租户 plan 缓存 TTL，避免每次请求查库 */
    private Duration planCacheTtl = Duration.ofMinutes(5);
    /** 非空时覆盖 PlanQuotaCatalog（仅 dev/test） */
    private Integer maxPerMinuteOverride;
  }

  @Data
  public static class LoginRateLimit {
    private int ipMaxAttempts = 5;
    private Duration ipWindow = Duration.ofMinutes(1);
    private int accountMaxAttempts = 5;
    private Duration accountWindow = Duration.ofMinutes(15);
  }

  @Data
  public static class ThrottledEmailEndpoint {
    private int ipMaxAttempts = 3;
    private Duration ipWindow = Duration.ofHours(1);
    private int emailMaxAttempts = 1;
    private Duration emailWindow = Duration.ofMinutes(15);
  }

  @Data
  public static class Audit {
    /** 为 true 时除 CSV 外可推送 SIEM/Webhook（骨架，默认关闭） */
    private boolean webhookEnabled = false;
    private String webhookUrl = "";
    /** jsonl | ndjson */
    private String webhookFormat = "jsonl";
    /** 每批最大事件数 */
    private int webhookBatchSize = 50;
    /** HMAC-SHA256 签名密钥；空表示不签名 */
    private String webhookSigningSecret = "";
    /** 审计日志保留天数；0 表示未配置策略 */
    private int retentionDays = 365;
    /** 死信自动重试最大次数 */
    private int deadLetterMaxAttempts = 5;
    /** 死信重试基础间隔（毫秒），按 attempts 指数退避 */
    private long deadLetterRetryIntervalMs = 300_000L;
    /** 可选告警 Webhook URL（与主 webhook 分离） */
    private String alertWebhookUrl = "";
    /** 连续健康检查失败次数达到阈值后自动禁用目标（Phase 14-3） */
    private int webhookHealthFailureThreshold = 3;
    /** 降级目标自愈冷却时间（毫秒，Phase 15-3） */
    private long selfHealCooldownMs = 3_600_000L;
  }

  @Data
  public static class ObjectStorage {
    /** local | s3-compatible（Phase 8 默认 local 目录） */
    private String provider = "local";
    private String localPath = "./data/exports";
    private String bucket = "tenant-exports";
    private String publicBaseUrl = "";
    /** S3/MinIO endpoint，如 https://minio.example:9000 */
    private String endpoint = "";
    private String accessKey = "";
    private String secretKey = "";
    private String region = "us-east-1";
    /** 为 true 且 provider=s3-compatible 时使用 AWS SDK PutObject（Phase 10-3） */
    private boolean useRealS3 = false;
    /** 超过此字节数时使用 multipart / 流式上传（Phase 11-5） */
    private long multipartThresholdBytes = 5L * 1024 * 1024;
    /** 对象生命周期过期天数；0 表示未启用自动清理 */
    private int lifecycleExpireDays = 0;
    /** 跨区复制目标 bucket；空表示未启用 */
    private String replicationTargetBucket = "";
    /** 跨区复制目标 region */
    private String replicationRegion = "";
    /** 合规保留天数；0 表示未启用 */
    private int complianceRetainDays = 0;
    /** KMS 密钥 ID；配合 serverSideEncryption=aws:kms（Phase 13-5） */
    private String kmsKeyId = "";
    /** AES256 | aws:kms；空表示不启用 SSE */
    private String serverSideEncryption = "";
    /** Phase 14-5：WORM Object Lock */
    private boolean wormEnabled = false;
    /** GOVERNANCE | COMPLIANCE */
    private String objectLockMode = "GOVERNANCE";
    /** DR 演练目标 bucket */
    private String drDrillTargetBucket = "";
    /** Phase 15-5：跨区域 active-active */
    private boolean activeActiveEnabled = false;
    private String secondaryRegion = "";
    /** RPO 目标秒数 */
    private int rpoTargetSeconds = 300;
  }

  @Data
  public static class FinOps {
    /** 每万次 Billing API 调用估算成本（USD） */
    private double billingApiCallUnitCost = 0.05;
    /** 每活跃席位月估算成本（USD） */
    private double seatUnitCost = 12.0;
    /** 每 GB 存储月估算成本（USD） */
    private double storageGbUnitCost = 0.023;
    /** 月度预算上限（USD）；0 表示未配置 */
    private double monthlyBudgetUsd = 0;
    /** 告警阈值百分比（相对预算） */
    private int alertThresholdPercent = 80;
    /** 超预算时启用租户 API 节流骨架 */
    private boolean budgetThrottleEnabled = false;
  }

  private final FinOps finOps = new FinOps();
}
