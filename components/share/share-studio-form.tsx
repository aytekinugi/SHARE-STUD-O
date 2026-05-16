"use client";

import type * as React from "react";
import type { RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChannelLimitWarning } from "@/lib/share-channel-limits";
import { interpolateShare } from "@/lib/share-template";
import type { ChannelSnippet } from "@/lib/share-channel-snippets";
import type { ShareMessages } from "@/lib/share-trust-copy";
import { ShareChannelPreviews } from "@/components/share/share-channel-previews";
import { ShareUtmPanel } from "@/components/share/share-utm-panel";
import { ShareAbPanel } from "@/components/share/share-ab-panel";
import { ShareSocialPreview } from "@/components/share/share-social-preview";

type Props = {
  sc: ShareMessages;
  contentFocusRef: RefObject<HTMLElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  title: string;
  setTitle: (v: string) => void;
  text: string;
  setText: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
  hashtags: string;
  setHashtags: (v: string) => void;
  cta: string;
  setCta: (v: string) => void;
  warmClose: boolean;
  setWarmClose: (v: boolean) => void;
  assembled: string;
  limitWarnings: ChannelLimitWarning[];
  channelSnippets: ChannelSnippet[];
  textB: string;
  setTextB: (v: string) => void;
  activeVariant: "a" | "b";
  setActiveVariant: (v: "a" | "b") => void;
  utmSource: string;
  setUtmSource: (v: string) => void;
  utmMedium: string;
  setUtmMedium: (v: string) => void;
  utmCampaign: string;
  setUtmCampaign: (v: string) => void;
  onApplyUtmDefaults: () => void;
  onVerifyClipboard: () => void;
};

export function ShareStudioForm({
  sc,
  contentFocusRef,
  textareaRef,
  title,
  setTitle,
  text,
  setText,
  url,
  setUrl,
  hashtags,
  setHashtags,
  cta,
  setCta,
  warmClose,
  setWarmClose,
  assembled,
  limitWarnings,
  channelSnippets,
  textB,
  setTextB,
  activeVariant,
  setActiveVariant,
  utmSource,
  setUtmSource,
  utmMedium,
  setUtmMedium,
  utmCampaign,
  setUtmCampaign,
  onApplyUtmDefaults,
  onVerifyClipboard
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const overLimits = limitWarnings.filter((w) => w.over);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.06fr_.94fr]">
      <section
        ref={contentFocusRef as React.LegacyRef<HTMLElement>}
        tabIndex={-1}
        className="-outline-offset-2 scroll-mt-28 rounded-[2rem] outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        aria-label={sc.content.sectionAria}
      >
        <Card className="rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{sc.content.kicker}</p>
              <h2 className="mt-1 text-xl font-black text-white">{sc.content.title}</h2>
            </div>
            {prefersReducedMotion ? (
              <Wand2 className="hidden h-9 w-9 text-gold/80 sm:block" />
            ) : (
              <motion.div animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="hidden sm:block">
                <Wand2 className="h-9 w-9 text-gold/80" />
              </motion.div>
            )}
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">{sc.content.labelTitle}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={sc.content.phTitle} className="rounded-2xl" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">{sc.content.labelBody}</label>
              <Textarea
                ref={textareaRef as React.LegacyRef<HTMLTextAreaElement>}
                id="share-main-text"
                data-testid="share-main-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={sc.content.phBody}
                className="min-h-28 rounded-2xl"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">{sc.content.labelUrl}</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={sc.content.phUrl} type="url" className="rounded-2xl" />
            </div>
          </div>
        </Card>
      </section>

      <motion.div layout={!prefersReducedMotion} className="space-y-4">
        <Card className="relative overflow-hidden rounded-[2rem] border-gold/25 bg-gradient-to-b from-gold/[0.14] via-black/60 to-transparent p-6 shadow-[inset_0_1px_0_0_rgba(229,184,104,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(229,184,104,0.15),transparent_55%)]" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{sc.settings.kicker}</p>
            <h2 className="mt-1 text-lg font-black text-white">{sc.settings.title}</h2>
            <p className="mt-2 text-xs text-zinc-400">{sc.settings.hint}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-zinc-500">{sc.settings.labelTags}</label>
                <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder={sc.settings.phTags} className="rounded-2xl font-mono text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-500">{sc.settings.labelCta}</label>
                <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder={sc.settings.phCta} className="rounded-2xl" />
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={warmClose}
                onClick={() => setWarmClose(!warmClose)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                  warmClose ? "border-gold/35 bg-gold/10" : "border-white/10 bg-white/[0.04]"
                )}
              >
                <span className="text-sm font-bold text-white">{sc.settings.warmLabel}</span>
                <span className="text-xs text-zinc-400">{warmClose ? sc.settings.warmOn : sc.settings.warmOff}</span>
              </button>
            </div>
          </div>
        </Card>

        <ShareUtmPanel
          sc={sc}
          utmSource={utmSource}
          setUtmSource={setUtmSource}
          utmMedium={utmMedium}
          setUtmMedium={setUtmMedium}
          utmCampaign={utmCampaign}
          setUtmCampaign={setUtmCampaign}
          onApplyDefaults={onApplyUtmDefaults}
        />

        <ShareAbPanel
          sc={sc}
          text={text}
          setText={setText}
          textB={textB}
          setTextB={setTextB}
          activeVariant={activeVariant}
          setActiveVariant={setActiveVariant}
        />

        <ShareSocialPreview sc={sc} title={title} description={assembled} url={url} />

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.ogImage.title}</p>
          <p className="mt-1 text-[11px] text-zinc-500">{sc.ogImage.hint}</p>
          <a
            href={`/api/og/share?title=${encodeURIComponent(title || "Vanguard")}&level=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-bold text-gold underline"
          >
            {sc.ogImage.open}
          </a>
        </div>

        <Card className="rounded-[2rem] border border-white/10 p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.mediaNote.title}</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">{sc.mediaNote.body}</p>
        </Card>

        <Card className="rounded-[2rem] border border-white/10 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{sc.preview.kicker}</p>
          <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200">
            <pre className="whitespace-pre-wrap break-words font-sans">{assembled || sc.preview.empty}</pre>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
            <p className="text-xs text-zinc-500">
              {assembled.length} {sc.preview.chars}
            </p>
            <Button type="button" variant="ghost" size="sm" className="shrink-0 rounded-xl text-[11px] text-gold/90" onClick={onVerifyClipboard}>
              {sc.buttons.verifyClipboard}
            </Button>
          </div>
        </Card>

        <ShareChannelPreviews sc={sc} snippets={channelSnippets} />

        {limitWarnings.length > 0 ? (
          <Card className="rounded-2xl border border-white/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.charLimits.title}</p>
            {overLimits.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-500">{sc.charLimits.ok}</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-xs text-amber-100/90">
                {overLimits.map((w) => (
                  <li key={w.id}>
                    {interpolateShare(sc.charLimits.over, { label: w.label, limit: w.maxChars, current: w.current })}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}
      </motion.div>
    </div>
  );
}
