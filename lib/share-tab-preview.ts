/** İlk N sekme için host önizlemesi (PII yok, tam URL loglanmaz). */
export function firstTabHostnames(urls: string[], max = 3): { rank: number; host: string }[] {
  const out: { rank: number; host: string }[] = [];
  let rank = 0;
  for (const raw of urls) {
    if (out.length >= max) break;
    const t = raw.trim();
    if (!t) continue;
    try {
      const u = new URL(t);
      rank += 1;
      out.push({ rank, host: u.host || "(boş host)" });
    } catch {
      rank += 1;
      out.push({ rank, host: "(geçersiz URL)" });
    }
  }
  return out;
}
