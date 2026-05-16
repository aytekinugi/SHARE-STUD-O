#!/usr/bin/env node
/**
 * Sync OAuth keys from .env.oauth.local → Vercel (production only).
 * Usage: cp .env.oauth.example .env.oauth.local && fill values && node scripts/sync-oauth-env.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const envPath = path.join(process.cwd(), ".env.oauth.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing .env.oauth.local — copy from .env.oauth.example");
  process.exit(1);
}

const KEYS = [
  "META_APP_ID",
  "META_APP_SECRET",
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "TIKTOK_CLIENT_KEY",
  "TIKTOK_CLIENT_SECRET"
];

const map = new Map();
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
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

let ok = 0;
for (const key of KEYS) {
  const value = map.get(key)?.trim();
  if (!value) {
    console.warn(`Skip ${key} — empty`);
    continue;
  }
  const res = spawnSync(
    "npx",
    ["vercel@latest", "env", "add", key, "production", "--force"],
    { input: value, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );
  if (res.status !== 0) {
    console.error(`Failed ${key}:`, res.stderr?.trim() || res.stdout?.trim());
    process.exit(res.status ?? 1);
  }
  ok++;
}

console.log(`Synced ${ok} OAuth keys to Vercel production. Redeploy: npx vercel deploy --prod`);
