/**
 * PostPilot mobil OAuth — authorization code → access token (secret sunucuda).
 */

export type OAuthExchangeBody = {
  code?: string;
  redirect_uri?: string;
};

export async function exchangeMetaCode(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; metadata: Record<string, unknown> } | null> {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appId || !appSecret) return null;

  const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  if (!tokenRes.ok) return null;
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: unknown };
  const shortToken = tokenJson.access_token;
  if (!shortToken) return null;

  const longUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", appId);
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("fb_exchange_token", shortToken);

  const longRes = await fetch(longUrl.toString());
  let accessToken = shortToken;
  if (longRes.ok) {
    const longJson = (await longRes.json()) as { access_token?: string };
    if (longJson.access_token) accessToken = longJson.access_token;
  }

  const pagesUrl = new URL("https://graph.facebook.com/v21.0/me/accounts");
  pagesUrl.searchParams.set("access_token", accessToken);
  const pagesRes = await fetch(pagesUrl.toString());
  const metadata: Record<string, unknown> = { user_token: accessToken };
  if (pagesRes.ok) {
    const pagesJson = (await pagesRes.json()) as {
      data?: Array<{ id: string; name: string; access_token?: string }>;
    };
    const first = pagesJson.data?.[0];
    if (first?.access_token) {
      metadata.page_id = first.id;
      metadata.page_name = first.name;
      accessToken = first.access_token;

      const igUrl = new URL(`https://graph.facebook.com/v21.0/${first.id}`);
      igUrl.searchParams.set("fields", "instagram_business_account");
      igUrl.searchParams.set("access_token", accessToken);
      const igRes = await fetch(igUrl.toString());
      if (igRes.ok) {
        const igJson = (await igRes.json()) as {
          instagram_business_account?: { id?: string };
        };
        const igId = igJson.instagram_business_account?.id;
        if (igId) metadata.instagram_business_id = igId;
      }
    }
  }

  return { access_token: accessToken, metadata };
}

export async function exchangeTikTokCode(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; metadata: Record<string, unknown> } | null> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  if (!clientKey || !clientSecret) return null;

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri
  });

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    access_token?: string;
    open_id?: string;
    refresh_token?: string;
  };
  if (!json.access_token) return null;

  return {
    access_token: json.access_token,
    metadata: {
      open_id: json.open_id,
      refresh_token: json.refresh_token
    }
  };
}

export async function exchangeLinkedInCode(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; metadata: Record<string, unknown> } | null> {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) return null;

  const metadata: Record<string, unknown> = {};
  try {
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${json.access_token}` }
    });
    if (profileRes.ok) {
      const profile = (await profileRes.json()) as { sub?: string; name?: string };
      if (profile.sub) metadata.member_urn = `urn:li:person:${profile.sub}`;
      if (profile.name) metadata.display_name = profile.name;
    }
  } catch {
    /* optional */
  }

  return { access_token: json.access_token, metadata };
}
