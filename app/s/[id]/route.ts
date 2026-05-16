import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Props = { params: { id: string } };

export async function GET(_req: Request, { params }: Props) {
  const id = params.id?.trim();
  if (!id) return NextResponse.redirect(new URL("/share", _req.url));

  const { data, error } = await supabaseAdmin().from("short_links").select("target_url").eq("id", id).maybeSingle();

  if (error || !data?.target_url) {
    return NextResponse.redirect(new URL("/share", _req.url));
  }

  void supabaseAdmin().rpc("increment_short_link_clicks", { link_id: id });

  return NextResponse.redirect(data.target_url, 302);
}
