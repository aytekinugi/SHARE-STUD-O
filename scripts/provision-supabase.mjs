#!/usr/bin/env node
/**
 * Creates or reuses a Supabase project and applies schema + share migration.
 * Requires: SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens)
 * Optional: SUPABASE_PROJECT_REF — skip create and use existing project
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";

const API = "https://api.supabase.com/v1";
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const PROD_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://workspace-019e1851-2264-701d-8942-9.vercel.app";

if (!token) {
  console.error("Set SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)");
  process.exit(1);
}

async function api(method, route, body) {
  const res = await fetch(`${API}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${route} → ${res.status}: ${text.slice(0, 400)}`);
  }
  return json;
}

async function runSqlFile(ref, filePath) {
  const query = fs.readFileSync(filePath, "utf8");
  await api("POST", `/projects/${ref}/database/query`, { query });
}

async function waitHealthy(ref, maxMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const p = await api("GET", `/projects/${ref}`);
    if (p.status === "ACTIVE_HEALTHY") return p;
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`Project ${ref} not healthy in time`);
}

async function main() {
  let ref = process.env.SUPABASE_PROJECT_REF?.trim();

  if (!ref) {
    const orgs = await api("GET", "/organizations");
    const org = orgs?.[0];
    if (!org?.id) throw new Error("No Supabase organization on this account.");
    const dbPass = crypto.randomBytes(24).toString("base64url");
    const created = await api("POST", "/projects", {
      name: "share-stud-o",
      organization_id: org.id,
      region: "eu-central-1",
      db_pass: dbPass
    });
    ref = created.id;
    console.log("Created project:", ref);
    await waitHealthy(ref);
  } else {
    console.log("Using existing project:", ref);
    await waitHealthy(ref);
  }

  const keys = await api("GET", `/projects/${ref}/api-keys`);
  const anon = keys.find((k) => k.name === "anon")?.api_key;
  const service = keys.find((k) => k.name === "service_role")?.api_key;
  if (!anon || !service) throw new Error("Could not read API keys");

  const url = `https://${ref}.supabase.co`;
  const schemaPath = path.join(process.cwd(), "supabase/schema.sql");
  const migPath = path.join(process.cwd(), "supabase/migrations/20260516120000_share_studio_extras.sql");

  console.log("Applying schema.sql …");
  await runSqlFile(ref, schemaPath);
  console.log("Applying share migration …");
  await runSqlFile(ref, migPath);

  try {
    await api("PATCH", `/projects/${ref}/config/auth`, {
      site_url: PROD_URL,
      uri_allow_list: `${PROD_URL}/**,https://*.vercel.app/**,http://localhost:3000/**`
    });
  } catch (e) {
    console.warn("Auth URL patch skipped (set manually in Supabase → Auth → URL config):", e.message);
  }

  const envLocal = [
    `NEXT_PUBLIC_SUPABASE_URL=${url}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}`,
    `SUPABASE_SERVICE_ROLE_KEY=${service}`,
    `NEXT_PUBLIC_APP_URL=${PROD_URL}`,
    `SERVER_ACTIONS_ALLOWED_ORIGINS=workspace-019e1851-2264-701d-8942-9.vercel.app`,
    `SUPABASE_PROJECT_REF=${ref}`,
    ""
  ].join("\n");

  const envPath = path.join(process.cwd(), ".env.local");
  fs.writeFileSync(envPath, envLocal);
  console.log("Wrote", envPath);

  const sync = spawnSync("node", ["scripts/sync-vercel-env.mjs"], { stdio: "inherit", encoding: "utf8" });
  if (sync.status !== 0) process.exit(sync.status ?? 1);

  console.log("\nDone. Redeploy: npx vercel@latest deploy --prod");
  console.log("Phone test:", `${PROD_URL}/share`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
