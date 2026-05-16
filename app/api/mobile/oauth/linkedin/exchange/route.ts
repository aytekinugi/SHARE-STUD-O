import { NextResponse } from "next/server";
import { createApiSupabase, getApiUser } from "@/lib/supabase-api";
import { exchangeLinkedInCode, type OAuthExchangeBody } from "@/lib/mobile-oauth";

export async function POST(req: Request) {
  let supabase;
  try {
    supabase = createApiSupabase(req);
  } catch {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user }
  } = await getApiUser(supabase, req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: OAuthExchangeBody;
  try {
    body = (await req.json()) as OAuthExchangeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = body.code?.trim();
  const redirectUri = body.redirect_uri?.trim();
  if (!code || !redirectUri) {
    return NextResponse.json({ error: "code and redirect_uri required" }, { status: 400 });
  }

  const result = await exchangeLinkedInCode(code, redirectUri);
  if (!result) {
    return NextResponse.json(
      { error: "LinkedIn token exchange failed — check LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET" },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
