import fs from "node:fs";
import path from "node:path";

/** Uncompressed chunk sum from build manifest (~2–3× Next “First Load JS” gzip figure). */
const MAX_SHARE_ROUTE_KB = 750;
const manifestPath = path.join(process.cwd(), ".next", "app-build-manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error("Run npm run build first.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const shareChunks = manifest.pages?.["/share/page"] ?? [];

let total = 0;
for (const rel of shareChunks) {
  if (!rel.endsWith(".js")) continue;
  const file = path.join(process.cwd(), ".next", rel);
  if (fs.existsSync(file)) total += fs.statSync(file).size;
}

const kb = Math.round(total / 1024);
console.log(`/share first-load JS (manifest sum): ${kb} KB (budget ${MAX_SHARE_ROUTE_KB} KB)`);

if (kb > MAX_SHARE_ROUTE_KB) {
  console.error("Bundle budget exceeded for /share — run npm run analyze");
  process.exit(1);
}
