import { describe, expect, it } from "vitest";
import { parseStripeWebhookSecret } from "@/lib/stripe-webhook-env";

describe("parseStripeWebhookSecret", () => {
  it("rejects empty or missing secret", () => {
    expect(parseStripeWebhookSecret(undefined).success).toBe(false);
    expect(parseStripeWebhookSecret("   ").success).toBe(false);
    expect(parseStripeWebhookSecret("short").success).toBe(false);
  });

  it("accepts trimmed secret with minimum length", () => {
    const result = parseStripeWebhookSecret("  whsec_abcdefghij  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("whsec_abcdefghij");
  });
});
