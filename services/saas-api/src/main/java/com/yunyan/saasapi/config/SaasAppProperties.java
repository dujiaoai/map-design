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
}
