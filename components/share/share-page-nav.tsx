"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShareMessages, inferBrowserShareLocale, readStoredShareLocale, type ShareLocale } from "@/lib/share-i18n";

export function SharePageNav() {
  const [locale, setLocale] = useState<ShareLocale>("tr");
  useEffect(() => {
    setLocale(readStoredShareLocale() ?? inferBrowserShareLocale());
  }, []);
  const sc = getShareMessages(locale);

  return (
    <nav className="sticky top-0 z-20 border-b border-white/10 bg-black/70 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 rounded-full">
            <ArrowLeft className="h-4 w-4" /> Vanguard
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-gold" />
          <Link href="/login">
            <Button variant="secondary" size="sm" className="rounded-full">
              {sc.page.navLogin}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
