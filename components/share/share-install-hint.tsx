"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShareMessages, inferBrowserShareLocale, readStoredShareLocale, type ShareLocale } from "@/lib/share-i18n";

const DISMISS_KEY = "share_install_hint_dismissed_v1";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobileUa(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function ShareInstallHint() {
  const [locale, setLocale] = useState<ShareLocale>("tr");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setLocale(readStoredShareLocale() ?? inferBrowserShareLocale());
    if (!isMobileUa() || isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const sc = getShareMessages(locale);
  const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const body = isIos ? sc.installHint.ios : sc.installHint.android;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div
      className="mx-auto mb-4 flex max-w-4xl items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-amber-50"
      role="status"
    >
      <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
      <div className="min-w-0 flex-1">
        <p>{body}</p>
        <Button type="button" variant="ghost" size="sm" className="mt-2 h-8 rounded-full px-3" onClick={dismiss}>
          {sc.installHint.dismiss}
        </Button>
      </div>
    </div>
  );
}
