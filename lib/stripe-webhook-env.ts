import { z } from "zod";

const secretSchema = z.string().min(12, "STRIPE_WEBHOOK_SECRET kısa veya eksik görünüyor");

/** Route içinde doğrulanmış gizli değeri döndürür. */
export function parseStripeWebhookSecret(raw: string | undefined): z.SafeParseReturnType<string, string> {
  const trimmed = raw?.trim() ?? "";
  return secretSchema.safeParse(trimmed);
}
