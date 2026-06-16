package com.yunyan.saasapi.security.mfa;

import com.yunyan.saasapi.config.SaasAppProperties;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class MfaSecretCipher {

  private static final String ALGORITHM = "AES/GCM/NoPadding";
  private static final int GCM_TAG_BITS = 128;
  private static final int IV_BYTES = 12;

  private final byte[] keyBytes;

  public MfaSecretCipher(SaasAppProperties saasAppProperties) {
    this.keyBytes = decodeKey(saasAppProperties.getAuth().getAdminMfa().getSecretEncryptionKey());
  }

  public String encrypt(String plaintext) {
    try {
      var iv = new byte[IV_BYTES];
      java.security.SecureRandom.getInstanceStrong().nextBytes(iv);
      var cipher = Cipher.getInstance(ALGORITHM);
      cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_BITS, iv));
      var ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
      var payload = new byte[IV_BYTES + ciphertext.length];
      System.arraycopy(iv, 0, payload, 0, IV_BYTES);
      System.arraycopy(ciphertext, 0, payload, IV_BYTES, ciphertext.length);
      return Base64.getEncoder().encodeToString(payload);
    } catch (GeneralSecurityException ex) {
      throw new IllegalStateException("Failed to encrypt MFA secret", ex);
    }
  }

  public String decrypt(String encoded) {
    try {
      var payload = Base64.getDecoder().decode(encoded);
      if (payload.length <= IV_BYTES) {
        throw new IllegalArgumentException("Invalid MFA ciphertext");
      }
      var iv = new byte[IV_BYTES];
      System.arraycopy(payload, 0, iv, 0, IV_BYTES);
      var ciphertext = new byte[payload.length - IV_BYTES];
      System.arraycopy(payload, IV_BYTES, ciphertext, 0, ciphertext.length);
      var cipher = Cipher.getInstance(ALGORITHM);
      cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_BITS, iv));
      return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    } catch (GeneralSecurityException ex) {
      throw new IllegalStateException("Failed to decrypt MFA secret", ex);
    }
  }

  private static byte[] decodeKey(String configured) {
    if (!StringUtils.hasText(configured)) {
      throw new IllegalStateException("saas.auth.admin-mfa.secret-encryption-key is required");
    }
    var key = Base64.getDecoder().decode(configured.trim());
    if (key.length != 32) {
      throw new IllegalStateException("saas.auth.admin-mfa.secret-encryption-key must decode to 32 bytes");
    }
    return key;
  }
}
