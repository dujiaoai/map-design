package com.yunyan.saasapi.security.mfa;

import com.yunyan.saasapi.config.SaasAppProperties;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.CodeGenerationException;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TotpSupport {

  private static final int SECRET_CHARACTERS = 32;

  private final SaasAppProperties saasAppProperties;
  private final SecretGenerator secretGenerator = new DefaultSecretGenerator(SECRET_CHARACTERS);
  private final TimeProvider timeProvider = new SystemTimeProvider();
  private final CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1);
  private final CodeVerifier codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
  private final QrGenerator qrGenerator = new ZxingPngQrGenerator();

  public String generateSecret() {
    return secretGenerator.generate();
  }

  public String buildOtpauthUri(String secret, String accountEmail) {
    return new QrData.Builder()
        .label(accountEmail)
        .secret(secret)
        .issuer(saasAppProperties.getAuth().getAdminMfa().getTotpIssuer())
        .algorithm(HashingAlgorithm.SHA1)
        .digits(6)
        .period(30)
        .build()
        .getUri();
  }

  public String buildQrCodeDataUrl(String secret, String accountEmail) {
    try {
      var data =
          new QrData.Builder()
              .label(accountEmail)
              .secret(secret)
              .issuer(saasAppProperties.getAuth().getAdminMfa().getTotpIssuer())
              .algorithm(HashingAlgorithm.SHA1)
              .digits(6)
              .period(30)
              .build();
      var image = qrGenerator.generate(data);
      return "data:image/png;base64," + Base64.getEncoder().encodeToString(image);
    } catch (QrGenerationException ex) {
      throw new IllegalStateException("Failed to generate TOTP QR code", ex);
    }
  }

  public boolean verifyCode(String secret, String code) {
    if (code == null || !code.matches("\\d{6}")) {
      return false;
    }
    return codeVerifier.isValidCode(secret, code.trim());
  }

  private static final int TOTP_PERIOD_SECONDS = 30;

  public String currentCode(String secret) {
    try {
      var counter = Math.floorDiv(timeProvider.getTime(), TOTP_PERIOD_SECONDS);
      return codeGenerator.generate(secret, counter);
    } catch (CodeGenerationException ex) {
      throw new IllegalStateException("Failed to generate TOTP code", ex);
    }
  }
}
