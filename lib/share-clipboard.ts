/** Tarayıcıda pano yazma — SSR import güvenli, çağrı client’ta yapılmalı. */

export function syncCopyToClipboard(text: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.readOnly = true;
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "-9999px";
    ta.setAttribute("aria-hidden", "true");
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export async function writeClipboardPreferApi(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* API reddi */
  }
  return syncCopyToClipboard(text);
}

export async function readClipboardText(): Promise<string | null> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function") {
      return await navigator.clipboard.readText();
    }
  } catch {
    return null;
  }
  return null;
}
