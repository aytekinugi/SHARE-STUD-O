#!/usr/bin/env node
/** Lists orgs/projects — helps when dashboard "Create project" fails. */
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN gerekli (Account → Access Tokens)");
  process.exit(1);
}

const API = "https://api.supabase.com/v1";

async function api(route) {
  const res = await fetch(`${API}${route}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${route} → ${res.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

try {
  const orgs = await api("/organizations");
  console.log("Organizasyonlar:", orgs.length);
  for (const o of orgs) {
    console.log(`  - ${o.name} (id: ${o.id})`);
  }
  const projects = await api("/projects");
  console.log("\nProjeler:", projects.length, "(ücretsiz planda org başına genelde max 2)");
  for (const p of projects) {
    console.log(`  - ${p.name} | ref: ${p.id} | status: ${p.status} | region: ${p.region}`);
  }
  if (projects.length >= 2) {
    console.log("\n⚠ İki proje doluysa yeni proje açılamaz. Eski projeyi sil veya mevcut ref ile setup kullan:");
    console.log("  SUPABASE_PROJECT_REF=" + projects[0].id + " npm run setup:phone");
  } else if (projects.length === 1) {
    console.log("\n✓ Mevcut projeyi kullan:");
    console.log("  SUPABASE_PROJECT_REF=" + projects[0].id + " npm run setup:phone");
  } else {
    console.log("\n✓ Proje yok — terminalden oluştur:");
    console.log("  npm run setup:phone");
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
