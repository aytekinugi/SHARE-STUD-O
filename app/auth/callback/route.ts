import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function safeRelativePath(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/dashboard";
  }
  return nextParam;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = safeRelativePath(searchParams.get("next"));
  const err = searchParams.get("error_description") ?? searchParams.get("error");

  if (err) {
    return NextResponse.redirect(new URL("/login?oauth_error=1", origin));
  }

  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[auth/callback] exchangeCodeForSession:", error.message);
        return NextResponse.redirect(new URL("/login?oauth_error=1", origin));
      }
    } catch {
      return NextResponse.redirect(new URL("/login?reason=env", origin));
    }
  }

  return NextResponse.redirect(new URL(`${nextPath}`, origin));
}
