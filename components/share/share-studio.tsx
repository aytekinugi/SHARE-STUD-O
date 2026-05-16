"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Copy, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useOnline } from "@/hooks/use-online";
import { useShareStudioState } from "@/hooks/use-share-studio-state";
import { shareNotSentChecklistFrom } from "@/lib/share-trust-copy";
import { CHANNEL_BY_ID } from "@/components/share/share-channels-config";
import { ShareTrustBanner } from "@/components/share/share-trust-banner";
import { ShareSafariNote } from "@/components/share/share-safari-note";
import { ShareBatchDialog } from "@/components/share/share-batch-dialog";
import { ShareChannelCard } from "@/components/share/share-channel-card";
import { ShareStudioToolbar } from "@/components/share/share-studio-toolbar";
import { ShareStudioForm } from "@/components/share/share-studio-form";
import { ShareStudioFooter } from "@/components/share/share-studio-footer";
import { ShareQrDialog } from "@/components/share/share-qr-dialog";
import { EXTRA_CHANNELS } from "@/components/share/share-channels-config";

const ShareExtraNetworksPanel = dynamic(
  () => import("@/components/share/share-extra-networks-panel").then((m) => ({ default: m.ShareExtraNetworksPanel })),
  { ssr: false, loading: () => <div className="py-6 text-center text-xs text-zinc-500">…</div> }
);

export function ShareStudio() {
  const online = useOnline();
  const prefersReducedMotion = useReducedMotion();
  const contentFocusRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const s = useShareStudioState();
  const notSent = shareNotSentChecklistFrom(s.sc);
  const { batch } = s;

  useEffect(() => {
    function typingTarget(t: EventTarget | null) {
      const el = t as HTMLElement | null;
      if (!el) return false;
      return Boolean(el.closest("input, textarea, select, [contenteditable=true]"));
    }
    function onKey(e: KeyboardEvent) {
      if (typingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        textareaRef.current?.focus({ preventScroll: false });
        return;
      }
      if (e.key.toLowerCase() === "g") {
        e.preventDefault();
        contentFocusRef.current?.focus({ preventScroll: false });
        return;
      }
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        batch.requestBatch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [batch]);

  const closeBatchDialog = () => batch.batchDialogRef.current?.close();

  return (
    <main className="min-h-screen px-4 pb-[calc(11rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em] text-gold"
            >
              {s.sc.hero.kicker}
            </motion.div>
            <div role="group" aria-label={s.sc.localeSwitch.label} className="inline-flex gap-0.5 rounded-full border border-white/10 bg-black/50 p-1">
              <button
                type="button"
                onClick={() => s.setLocalePersist("tr")}
                className={cn("rounded-full px-3 py-1.5 text-xs font-bold transition", s.locale === "tr" ? "bg-gold/25 text-gold" : "text-zinc-500 hover:text-zinc-300")}
                aria-pressed={s.locale === "tr"}
              >
                {s.sc.localeSwitch.tr}
              </button>
              <button
                type="button"
                onClick={() => s.setLocalePersist("en")}
                className={cn("rounded-full px-3 py-1.5 text-xs font-bold transition", s.locale === "en" ? "bg-gold/25 text-gold" : "text-zinc-500 hover:text-zinc-300")}
                aria-pressed={s.locale === "en"}
              >
                {s.sc.localeSwitch.en}
              </button>
            </div>
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            {s.sc.hero.titleBefore}
            <span className="text-gold">{s.sc.hero.titleHighlight}</span>
          </h1>
          <ShareTrustBanner sc={s.sc} />
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">{s.sc.hero.intro}</p>
          <p className="mx-auto mt-2 flex flex-wrap justify-center gap-2 text-[11px] text-zinc-500">
            <span>
              {s.sc.hero.keyboard}{" "}
              <kbd className="rounded border border-white/15 bg-black/60 px-1.5 py-0.5 font-mono">/</kbd> {s.sc.hero.kbdSlash}{" "}
              <kbd className="rounded border border-white/15 bg-black/60 px-1.5 py-0.5 font-mono">G</kbd> {s.sc.hero.kbdG}{" "}
              <kbd className="rounded border border-white/15 bg-black/60 px-1.5 py-0.5 font-mono">B</kbd> {s.sc.hero.kbdB}
            </span>
          </p>
          {s.contextualTips.length > 0 ? (
            <aside className="mx-auto mb-6 mt-6 max-w-2xl rounded-2xl border border-gold/20 bg-black/35 p-4 text-left backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{s.sc.tipsSectionTitle}</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 text-xs text-zinc-300">
                {s.contextualTips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </aside>
          ) : null}
        </header>

        {s.debugMode ? (
          <p className="mb-4 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-center text-[11px] text-gold">{s.sc.debug.banner}</p>
        ) : null}

        <ShareSafariNote sc={s.sc} />

        {!online ? (
          <div role="status" className="mb-6 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-50">
            <p className="font-bold text-amber-100">{s.sc.offlineBanner.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/90">{s.sc.offlineBanner.body}</p>
          </div>
        ) : null}

        <details className="mb-6 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left text-xs text-zinc-400 open:border-gold/20">
          <summary className="cursor-pointer select-none font-bold text-zinc-300">{s.sc.pwaNote.summary}</summary>
          <p className="mt-2 leading-relaxed">{s.sc.pwaNote.body}</p>
        </details>

        <ShareStudioToolbar
          sc={s.sc}
          debugMode={s.debugMode}
          importInputRef={s.importInputRef}
          onClear={s.clearAllData}
          onExport={s.exportJson}
          onImportClick={s.triggerImport}
          onImportFile={s.onImportFile}
          onQr={() => s.setQrOpen(true)}
          onTemplate={s.applyTemplate}
          onCampaignLatest={() => void s.importCampaign()}
        />

        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <Button type="button" size="lg" className="flex-1 rounded-2xl font-black" onClick={() => void s.nativeShare()} disabled={s.nativeBusy}>
            <Share2 className="mr-2 h-5 w-5" />
            {s.sc.buttons.nativeShare}
          </Button>
          <Button type="button" size="lg" variant="secondary" className="flex-1 rounded-2xl font-bold" onClick={() => void s.copyToClipboard(s.sc.toasts.copySuccess)}>
            <Copy className="mr-2 h-5 w-5" />
            {s.sc.buttons.copyOnly}
          </Button>
        </div>

        <Card className="mb-8 rounded-[1.75rem] border border-white/12 bg-white/[0.03] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">{s.sc.policyCard.title}</p>
          <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs text-zinc-400 sm:text-sm">
            {s.sc.policyCard.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>

        <ShareStudioForm
          sc={s.sc}
          contentFocusRef={contentFocusRef}
          textareaRef={textareaRef}
          title={s.title}
          setTitle={s.setTitle}
          text={s.text}
          setText={s.setText}
          url={s.url}
          setUrl={s.setUrl}
          hashtags={s.hashtags}
          setHashtags={s.setHashtags}
          cta={s.cta}
          setCta={s.setCta}
          warmClose={s.warmClose}
          setWarmClose={s.setWarmClose}
          assembled={s.assembled}
          limitWarnings={s.limitWarnings}
          onVerifyClipboard={() => void s.verifyClipboardSnippet()}
        />

        <section className="mt-12">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-center text-lg font-black text-white sm:text-left">{s.sc.channelsSection}</h2>
              <p className="mt-1 text-center text-[10px] text-zinc-500 sm:text-left">{s.sc.dragOrder.hint}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
              <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={s.selectAllPrimary}>
                {s.sc.buttons.selectAllPrimary}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="rounded-full text-zinc-400" onClick={s.clearPrimary}>
                {s.sc.buttons.clearPrimary}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="rounded-full text-zinc-400" onClick={s.resetChannelOrder}>
                {s.sc.dragOrder.reset}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {s.sortedPrimary.map((ch) => (
              <ShareChannelCard
                key={ch.id}
                ch={ch}
                sc={s.sc}
                isOn={s.selected.has(ch.id)}
                richPayload={s.richPayload}
                pinterestMedia={s.pinterestMedia}
                mastodonHost={s.mastodonHost}
                draggingId={s.draggingId}
                onToggle={() => s.toggleChannel(ch.id)}
                onCopy={() => void s.copyToClipboard(s.copyMsg[ch.id] ?? s.sc.toasts.copySuccess)}
                onDragStart={() => s.onChannelDragStart(ch.id)}
                onDragEnd={s.onChannelDragEnd}
                onDrop={() => s.onChannelDrop(ch.id)}
              />
            ))}
          </div>
        </section>

        <div className="mt-12">
          <button
            type="button"
            onClick={() => s.setMoreOpen(!s.moreOpen)}
            className="glass mx-auto mb-6 flex w-full max-w-xl items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 text-sm font-bold text-white transition hover:border-gold/35"
          >
            <Sparkles className="h-4 w-4 text-gold" />
            {s.sc.buttons.moreNetworks} ({EXTRA_CHANNELS.length})
            <ChevronDown className={cn("h-4 w-4 transition", s.moreOpen && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {s.moreOpen && (
              <motion.div
                initial={{ opacity: prefersReducedMotion ? 1 : 0, height: prefersReducedMotion ? "auto" : 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: prefersReducedMotion ? 1 : 0, height: prefersReducedMotion ? "auto" : 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.26, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <ShareExtraNetworksPanel
                  sc={s.sc}
                  pinterestMedia={s.pinterestMedia}
                  setPinterestMedia={s.setPinterestMedia}
                  mastodonHost={s.mastodonHost}
                  setMastodonHost={s.setMastodonHost}
                  selectAllExtras={s.selectAllExtras}
                  clearExtras={s.clearExtras}
                  extraChannels={s.sortedExtra}
                  renderChannelCard={(ch) => (
                    <ShareChannelCard
                      key={ch.id}
                      ch={ch}
                      sc={s.sc}
                      isOn={s.selected.has(ch.id)}
                      richPayload={s.richPayload}
                      pinterestMedia={s.pinterestMedia}
                      mastodonHost={s.mastodonHost}
                      draggingId={s.draggingId}
                      onToggle={() => s.toggleChannel(ch.id)}
                      onCopy={() => void s.copyToClipboard(s.copyMsg[ch.id] ?? s.sc.toasts.copySuccess)}
                      onDragStart={() => s.onChannelDragStart(ch.id)}
                      onDragEnd={s.onChannelDragEnd}
                      onDrop={() => s.onChannelDrop(ch.id)}
                    />
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ShareBatchDialog
          sc={s.sc}
          dialogRef={batch.batchDialogRef}
          selected={s.selected}
          channelById={CHANNEL_BY_ID}
          channelOrder={s.channelOrder}
          dlgUrlTotal={batch.dlgUrlTotal}
          dlgPreviewUrls={batch.dlgPreviewUrls}
          dlgOpenTabCount={batch.dlgOpenTabCount}
          setDlgOpenTabCount={batch.setDlgOpenTabCount}
          dlgCopyRemain={batch.dlgCopyRemain}
          setDlgCopyRemain={batch.setDlgCopyRemain}
          rememberSkipPreview={batch.rememberSkipPreview}
          setRememberSkipPreview={batch.setRememberSkipPreview}
          assembledLength={s.assembled.length}
          onClose={closeBatchDialog}
          onSubmit={(openN, copyRemainder, remember) => batch.executeBatchImmediate(openN, copyRemainder, remember)}
        />

        <aside className="mt-14 space-y-3 text-[11px] leading-relaxed text-zinc-500">
          <details className="rounded-2xl border border-white/10 bg-black/25 p-4 open:border-gold/15">
            <summary className="cursor-pointer select-none font-bold text-zinc-300">{notSent.title}</summary>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-zinc-500">
              {notSent.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
          <details className="rounded-2xl border border-white/10 bg-black/25 p-4 open:border-gold/15">
            <summary className="cursor-pointer select-none font-bold text-zinc-300">{s.sc.footer.privacyTitle}</summary>
            <p className="mt-2 text-zinc-500">{s.sc.footer.privacyBody}</p>
          </details>
          <details className="rounded-2xl border border-white/10 bg-black/25 p-4 open:border-gold/15">
            <summary className="cursor-pointer select-none font-bold text-zinc-300">{s.sc.footer.brandTitle}</summary>
            <p className="mt-2 text-zinc-500">{s.sc.footer.brandBody}</p>
          </details>
        </aside>
      </div>

      <ShareStudioFooter sc={s.sc} selectedCount={s.selected.size} batchBusy={batch.batchBusy} onBatch={batch.requestBatch} />

      <ShareQrDialog sc={s.sc} open={s.qrOpen} text={s.assembled} online={online} onClose={() => s.setQrOpen(false)} />
    </main>
  );
}
