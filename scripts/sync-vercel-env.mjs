#!/usr/bin/env node
/**
 * Reads .env.local and syncs keys to Vercel (production + preview + development).
 * Usage: node scripts/sync-vercel-env.mjs
 * Requires: vercel CLI logged in, .env.local in project root.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local — copy .env.example and fill Supabase keys first.");
  process.exit(1);
}

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
  "SERVER_ACTIONS_ALLOWED_ORIGINS",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_RELEASE"
];

const raw = fs.readFileSync(envPath, "utf8");
const map = new Map();
for (const line of raw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 1) continue;
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  map.set(k, v);
}

const targets = ["production", "preview", "development"];
let ok = 0;
let skip = 0;

for (const key of KEYS) {
  const value = map.get(key)?.trim();
  if (!value) {
    skip++;
    continue;
  }
  for (const target of targets) {
    const res = spawnSync(
      "npx",
      ["vercel@latest", "env", "add", key, target, "--force"],
      { input: value, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    if (res.status !== 0) {
      console.error(`Failed ${key} (${target}):`, res.stderr?.trim() || res.stdout?.trim());
      process.exit(res.status ?? 1);
    }
    ok++;
  }
}

console.log(`Synced ${ok} env entries (${skip} keys skipped — empty in .env.local).`);
console.log("Redeploy: npx vercel@latest deploy --prod");
