package com.yunyan.billingapi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "billing")
public class BillingAppProperties {

  private final SignupBonus signupBonus = new SignupBonus();
  private final Internal internal = new Internal();
  private final Payment payment = new Payment();
  private final Recharge recharge = new Recharge();
  private final Hold hold = new Hold();
  private final Refund refund = new Refund();
  private final Webhook webhook = new Webhook();
  private final RateLimit rateLimit = new RateLimit();
  private final LowBalance lowBalance = new LowBalance();
  private final MembershipSync membershipSync = new MembershipSync();
  private final Coupon coupon = new Coupon();
  private final WireTransfer wireTransfer = new WireTransfer();

  @Data
  public static class WireTransfer {
    /** Platform bank account shown to tenants for corporate wire remittance. */
    private final PlatformAccount platformAccount = new PlatformAccount();
  }

  @Data
  public static class PlatformAccount {
    private boolean enabled = false;
    private String accountName = "";
    private String bankName = "";
    private String accountNo = "";
    /** Suggested remittance remark, e.g. company name or request no. */
    private String transferRemark = "";
  }

  @Data
  public static class Coupon {
    /** single — one coupon per recharge order (default). */
    private String stackingMode = "single";
    private int maxCouponsPerRecharge = 1;
    /** Reject checkout when payable would drop below this amount (cents). */
    private long minPayableCentsAfterDiscount = 0L;
    /** Block a second pending recharge order that also uses a coupon. */
    private boolean blockConcurrentPendingRechargeCoupons = true;
  }

  @Data
  public static class RateLimit {
    private boolean enabled = true;
    private WebhookRateLimit webhook = new WebhookRateLimit();
    private AdminRateLimit admin = new AdminRateLimit();
    private RechargeRateLimit recharge = new RechargeRateLimit();
  }

  @Data
  public static class WebhookRateLimit {
    private int ipMaxAttempts = 120;
    private java.time.Duration ipWindow = java.time.Duration.ofMinutes(1);
  }

  @Data
  public static class AdminRateLimit {
    private int adjustMaxAttempts = 30;
    private java.time.Duration adjustWindow = java.time.Duration.ofHours(1);
    private int refundMaxAttempts = 10;
    private java.time.Duration refundWindow = java.time.Duration.ofHours(1);
  }

  @Data
  public static class RechargeRateLimit {
    private int userMaxAttempts = 20;
    private java.time.Duration userWindow = java.time.Duration.ofHours(1);
  }

  @Data
  public static class LowBalance {
    /** Emit billing.wallet.low_balance when available balance crosses below threshold. */
    private boolean enabled = true;
    /** Available balance (balance - frozen) threshold; aligns with saas-web LOW_BALANCE_THRESHOLD. */
    private long threshold = 50L;
  }

  @Data
  public static class Webhook {
    /** Shared token for payment provider callbacks (dev/skeleton fallback when signature verify off). */
    private String token = "dev-billing-webhook-token-change-me";
    /** When true, require channel-specific webhook signature verification. */
    private boolean signatureVerifyEnabled = false;
    /** hmac (default), wechat_v3, alipay_rsa */
    private String wechatSignatureMode = "hmac";
    private String alipaySignatureMode = "hmac";
    /** HMAC secret for WeChat callback dev verify. */
    private String wechatSignSecret = "";
    /** HMAC secret for Alipay callback dev verify. */
    private String alipaySignSecret = "";
    /** PEM platform public key for WeChat Pay API v3 notify verify. */
    private String wechatPlatformPublicKeyPem = "";
    /** PEM Alipay public key for notify RSA verify. */
    private String alipayPublicKeyPem = "";
  }

  @Data
  public static class Recharge {
    /** Pending order TTL before auto-expire (minutes). */
    private int orderTtlMinutes = 30;
    /** Scan interval for pending order expiry job (ms). */
    private long expireScanMs = 300_000L;
  }

  @Data
  public static class Refund {
    /** Scan interval for stuck refunding recovery job (ms). */
    private long recoveryScanMs = 300_000L;
    /** Treat refunding orders older than this as stuck (minutes). */
    private int stuckMinutes = 30;
  }

  @Data
  public static class Hold {
    private int ttlMinutes = 30;
    /** Max quantity per hold request (abuse guard). */
    private long maxQuantity = 10_000L;
    /** Max computed points debited per hold (aligns with adjust cap). */
    private long maxPointsPerHold = 1_000_000L;
    /** Max idempotency key length after trim. */
    private int idempotencyKeyMaxLength = 128;
    /** Max bizRef length. */
    private int bizRefMaxLength = 256;
  }

  @Data
  public static class Payment {
    /** Enables POST .../mock-pay for sandbox recharge completion. */
    private boolean mockEnabled = false;
    /** stub (default) or live — selects PaymentProviderClient implementation. */
    private String providerMode = "stub";
    /** Poll provider for pending wechat/alipay orders when live mode (callback fallback). */
    private boolean queryScanEnabled = false;
    /** Scan interval for pending payment query job (ms). */
    private long queryScanMs = 300_000L;
    private final Wechat wechat = new Wechat();
    private final Alipay alipay = new Alipay();
  }

  @Data
  public static class Wechat {
    private String appId = "";
    private String mchId = "";
    private String apiV3Key = "";
    /** Merchant API certificate serial number (WeChat Pay API v3). */
    private String merchantSerialNo = "";
    /** Merchant API private key PEM (apiclient_key.pem). */
    private String privateKeyPem = "";
    private String notifyUrl = "";
    /** WeChat Official Account app secret for JSAPI OAuth (snsapi_base). */
    private String appSecret = "";
    /** native | h5 | jsapi */
    private String defaultPayScene = "native";
  }

  @Data
  public static class Alipay {
    private String appId = "";
    private String privateKeyPem = "";
    /** Alipay platform public key PEM for response verify. */
    private String alipayPublicKeyPem = "";
    private String notifyUrl = "";
    /** Production or sandbox gateway. */
    private String gatewayUrl = "https://openapi.alipay.com/gateway.do";
    /** wap | native */
    private String defaultPayScene = "wap";
  }

  @Data
  public static class SignupBonus {
    private long personal = 500L;
    private long organization = 1000L;
  }

  @Data
  public static class Internal {
    /** Shared secret for saas-api → billing-api internal calls */
    private String token = "dev-billing-internal-token-change-me";
    /** Allowed {@link com.yunyan.billingapi.security.InternalAuthFilter#CALLER_SERVICE_HEADER} values; empty disables check. */
    private java.util.List<String> allowedCallers = java.util.List.of();
  }

  /** Periodic COPY of {@code sys_user} / {@code sys_tenant_feature} from saas DB (dedicated billing PG). */
  @Data
  public static class MembershipSync {
    private boolean enabled = false;
    /** local (shared PG / jdbc mirror), copy (saas PG periodic COPY), api (live check), cdc (event pull). */
    private String source = "local";
    /** saas-api origin, e.g. http://localhost:8082 — required when source=api or cdc. */
    private String saasApiBaseUrl = "";
    /** Accept POST /internal/v1/billing/membership/sync-events from saas-api. */
    private boolean pushReceiveEnabled = false;
    /** Scan interval for mirror sync job (ms). */
    private long scanMs = 300_000L;
    private final SaasDatasource saas = new SaasDatasource();
  }

  @Data
  public static class SaasDatasource {
    private String url = "";
    private String username = "saas";
    private String password = "saas";
  }
}
