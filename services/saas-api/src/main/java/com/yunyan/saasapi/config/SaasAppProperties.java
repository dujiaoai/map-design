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
  }

  @Data
  public static class RateLimit {
    private boolean enabled = true;
    private LoginRateLimit login = new LoginRateLimit();
    private ThrottledEmailEndpoint register = new ThrottledEmailEndpoint();
    private ThrottledEmailEndpoint passwordReset = new ThrottledEmailEndpoint();
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
}
