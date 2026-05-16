#!/usr/bin/env node
/**
 * One-shot phone-test setup: Supabase + Vercel env + production deploy.
 *
 * 1. Create token: https://supabase.com/dashboard/account/tokens
 * 2. Run: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/setup-phone-test.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", encoding: "utf8", ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
  if (fs.existsSync(envPath)) {
    const text = fs.readFileSync(envPath, "utf8");
    if (/NEXT_PUBLIC_SUPABASE_URL=\s*https?:\/\//.test(text) && /NEXT_PUBLIC_SUPABASE_ANON_KEY=\s*\S+/.test(text)) {
      console.log("Found .env.local — syncing Vercel env …");
      run("node", ["scripts/sync-vercel-env.mjs"]);
      run("npx", ["vercel@latest", "deploy", "--prod"]);
      console.log("\n✓ Deployed. Open on phone: https://workspace-019e1851-2264-701d-8942-9.vercel.app/share");
      process.exit(0);
    }
  }
  console.log(`
Share Stud O — telefon testi kurulumu

Supabase erişim token'ı gerekli (tek seferlik):
  https://supabase.com/dashboard/account/tokens → Generate new token

Terminalde:
  SUPABASE_ACCESS_TOKEN=sbp_xxxx node scripts/setup-phone-test.mjs

Bu komut: Supabase projesi oluşturur, şemayı yükler, .env.local yazar,
Vercel env senkronlar ve production deploy eder.

Şimdi sadece /share denemek için (giriş olmadan):
  https://workspace-019e1851-2264-701d-8942-9.vercel.app/share
`);
  process.exit(1);
}

run("node", ["scripts/provision-supabase.mjs"]);
run("npx", ["vercel@latest", "deploy", "--prod"]);
console.log("\n✓ Hazır. Telefonda Safari/Chrome ile /share açın → Paylaş → Ana Ekrana Ekle");
