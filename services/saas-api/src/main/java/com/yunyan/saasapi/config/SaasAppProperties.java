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
  }
}
