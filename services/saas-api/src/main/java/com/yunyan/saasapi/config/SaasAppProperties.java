package com.yunyan.saasapi.config;

import java.time.Duration;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "saas")
public class SaasAppProperties {

  private final Mail mail = new Mail();
  private final App app = new App();
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
  }

  @Data
  public static class Invite {
    private Duration tokenTtl = Duration.ofHours(48);
    private String tokenPepper = "dev-invite-pepper-change-me!!";
  }

  @Data
  public static class PasswordReset {
    private Duration tokenTtl = Duration.ofHours(1);
  }

  @Data
  public static class Registration {
    private Duration tokenTtl = Duration.ofHours(24);
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
