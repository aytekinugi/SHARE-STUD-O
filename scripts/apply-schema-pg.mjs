#!/usr/bin/env node
/** Apply schema + share migration via Postgres connection (.env.local). */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const url =
  process.env.POSTGRES_URL_NON_POOLING?.trim() ||
  process.env.POSTGRES_URL?.trim();
if (!url) {
  console.error("POSTGRES_URL_NON_POOLING missing in .env.local");
  process.exit(1);
}

const files = [
  path.join(process.cwd(), "supabase/schema.sql"),
  path.join(process.cwd(), "supabase/migrations/20260516120000_share_studio_extras.sql"),
  path.join(process.cwd(), "supabase/migrations/20260516140000_postpilot_posts.sql")
];

const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)/)?.[1];
const client = new pg.Client({
  host: process.env.POSTGRES_HOST?.includes("pooler")
    ? process.env.POSTGRES_HOST.trim()
    : `aws-1-us-east-1.pooler.supabase.com`,
  user: ref ? `postgres.${ref}` : process.env.POSTGRES_USER?.trim() || "postgres",
  password: process.env.POSTGRES_PASSWORD?.trim(),
  database: process.env.POSTGRES_DATABASE?.trim() || "postgres",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  for (const file of files) {
    console.log("Applying", path.basename(file), "…");
    const sql = fs.readFileSync(file, "utf8");
    await client.query(sql);
  }
  console.log("Schema applied.");
} catch (e) {
  console.error(e.message || e);
  process.exit(1);
} finally {
  await client.end();
}
