"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Crown, Flame, Share2, Sparkles, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { cn } from "@/lib/utils";
import {
  getAppMessages,
  inferBrowserAppLocale,
  readStoredAppLocale,
  writeStoredAppLocale,
  type AppLocale
} from "@/lib/app-i18n";

export function LandingContent() {
  const [locale, setLocale] = useState<AppLocale>("tr");
  const t = useMemo(() => getAppMessages(locale), [locale]);

  useEffect(() => {
    setLocale(readStoredAppLocale() ?? inferBrowserAppLocale());
  }, []);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-gold/30 bg-gold/10 shadow-gold">
            <Crown className="h-5 w-5 text-gold" />
          </div>
          <span className="text-lg font-black tracking-[0.24em] text-gold">VANGUARD</span>
        </div>
        <div className="flex items-center gap-2">
          <div role="group" aria-label={t.locale.label} className="hidden gap-0.5 rounded-full border border-white/10 bg-black/50 p-1 sm:inline-flex">
            {(["tr", "en"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocale(loc);
                  writeStoredAppLocale(loc);
                }}
                className={cn(
                  "rounded-full px-2 py-1 text-[10px] font-bold",
                  locale === loc ? "bg-gold/25 text-gold" : "text-zinc-500"
                )}
              >
                {loc === "tr" ? t.locale.tr : t.locale.en}
              </button>
            ))}
          </div>
          <Link href="/share">
            <Button variant="ghost" size="sm" className="hidden gap-2 sm:inline-flex">
              <Share2 className="h-4 w-4" /> {t.nav.shareStudio}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">{t.nav.enter}</Button>
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 py-16 md:grid-cols-[1.02fr_.98fr] md:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2 text-sm text-emerald">
            <Sparkles className="h-4 w-4" /> {t.hero.badge}
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl">
            {t.hero.titleBefore}
            <span className="text-gold">{t.hero.titleHighlight}</span>
            {t.hero.titleAfter}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">{t.hero.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                <Swords className="mr-2 h-5 w-5" /> {t.hero.start}
              </Button>
            </Link>
            <Link href="#vault">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Flame className="mr-2 h-5 w-5" /> {t.hero.vault}
              </Button>
            </Link>
            <Link href="/share">
              <Button size="lg" variant="secondary" className="w-full border border-gold/25 shadow-gold sm:w-auto">
                <Share2 className="mr-2 h-5 w-5" /> {t.hero.share}
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center text-sm text-zinc-400">
            {t.hero.stats.map((x) => (
              <div key={x} className="glass rounded-2xl p-3">
                {x}
              </div>
            ))}
          </div>
        </div>
        <HeroPreview />
      </section>

      <section id="vault" className="mx-auto max-w-5xl pb-20">
        <div className="glass rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-bold uppercase tracking-[0.3em] text-gold">{t.vault.kicker}</p>
              <h2 className="mt-2 text-3xl font-black text-white">{t.vault.title}</h2>
            </div>
            <div className="text-4xl font-black text-gold">
              {t.vault.price}
              <span className="text-base text-zinc-400">{t.vault.perMonth}</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {t.vault.perks.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[.03] p-4 text-zinc-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
