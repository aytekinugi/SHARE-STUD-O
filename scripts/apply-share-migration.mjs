#!/usr/bin/env node
/**
 * Applies share-studio migration when SUPABASE_DB_URL is set.
 * Example: SUPABASE_DB_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" node scripts/apply-share-migration.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const url = process.env.SUPABASE_DB_URL?.trim();
if (!url) {
  console.error("Set SUPABASE_DB_URL (Supabase → Project Settings → Database → Connection string).");
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), "supabase/migrations/20260516120000_share_studio_extras.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const res = spawnSync("psql", [url, "-v", "ON_ERROR_STOP=1", "-f", sqlPath], {
  encoding: "utf8",
  stdio: "inherit"
});

if (res.status !== 0) {
  console.error("Migration failed. Install psql or run the SQL file in Supabase SQL Editor.");
  process.exit(res.status ?? 1);
}

console.log("Migration applied:", sqlPath);
