"use client";

import type * as React from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clampOpenTabCount, orderedChannelIds } from "@/lib/share-channel-order";
import type { ShareMessages } from "@/lib/share-trust-copy";
import { firstTabHostnames } from "@/lib/share-tab-preview";
import type { ChannelDef } from "@/components/share/share-channels-config";
import { BATCH_PREVIEW_SKIP_KEY } from "@/hooks/use-share-batch";

type Props = {
  sc: ShareMessages;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  selected: Set<string>;
  channelById: Record<string, ChannelDef>;
  dlgUrlTotal: number;
  dlgPreviewUrls: string[];
  dlgOpenTabCount: number;
  setDlgOpenTabCount: (n: number) => void;
  dlgCopyRemain: boolean;
  setDlgCopyRemain: (v: boolean) => void;
  rememberSkipPreview: boolean;
  setRememberSkipPreview: (v: boolean) => void;
  assembledLength: number;
  channelOrder: string[];
  batchMaxTabs?: number;
  onSubmit: (openN: number, copyRemainder: boolean, rememberSkip: boolean) => void;
  onClose: () => void;
};

export function ShareBatchDialog({
  sc,
  dialogRef,
  selected,
  channelById,
  dlgUrlTotal,
  dlgPreviewUrls,
  dlgOpenTabCount,
  setDlgOpenTabCount,
  dlgCopyRemain,
  setDlgCopyRemain,
  rememberSkipPreview,
  setRememberSkipPreview,
  assembledLength,
  channelOrder,
  batchMaxTabs = 5,
  onSubmit,
  onClose
}: Props) {
  const tabCap = Math.min(batchMaxTabs, Math.max(dlgUrlTotal, 1));
  const openN = clampOpenTabCount(dlgOpenTabCount, tabCap);
  const simHosts = firstTabHostnames(dlgPreviewUrls.slice(0, openN), 5);

  const focusableSelector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dialog.open) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog.open) return;
      const nodes = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)].filter((el) => !el.hasAttribute("disabled"));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [dialogRef, dlgOpenTabCount, dlgUrlTotal, dlgPreviewUrls, onClose]);

  return (
    <dialog
      ref={dialogRef as React.LegacyRef<HTMLDialogElement>}
      className="z-[190] mx-auto max-h-[calc(100vh-2rem)] w-[min(100%-1.5rem,26rem)] rounded-[1.75rem] border border-white/15 bg-[#08080a] p-0 text-white shadow-2xl backdrop:bg-black/75 open:backdrop:backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby="share-batch-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form
        className="flex max-h-[inherit] flex-col gap-4 overflow-y-auto p-5 pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          const n = clampOpenTabCount(dlgOpenTabCount, tabCap);
          const remainder = dlgUrlTotal > n;
          onSubmit(n, dlgCopyRemain && remainder, rememberSkipPreview);
        }}
      >
        <div>
          <h2 id="share-batch-title" className="text-lg font-black text-white">
            {sc.batchDialog.title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {dlgUrlTotal} {sc.batchDialog.subtitle}
          </p>
          <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] leading-relaxed text-zinc-400">
            <span className="font-bold text-zinc-200">{sc.batchDialog.triggerExplainer}</span> {sc.batchDialog.triggerSteps}
          </p>
        </div>

        <div className="rounded-xl border border-gold/20 bg-gold/[0.06] px-3 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.batchDialog.hostPreviewTitle}</p>
          <p className="mt-1 text-[10px] text-zinc-500">{sc.batchDialog.hostPreviewHint}</p>
          {simHosts.length === 0 ? (
            <p className="mt-2 text-xs text-zinc-500">{sc.batchDialog.hostPreviewEmpty}</p>
          ) : (
            <ol className="mt-2 space-y-1 font-mono text-[11px] text-zinc-200" data-testid="share-batch-host-preview">
              {simHosts.map((h) => (
                <li key={`${h.rank}-${h.host}`}>
                  {h.rank}. {h.host}
                </li>
              ))}
            </ol>
          )}
        </div>

        {(dlgUrlTotal > 6 || assembledLength > 5200) && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/95">
            {dlgUrlTotal > 6 ? sc.batchDialog.heavyTabs : ""}
            {assembledLength > 5200 ? sc.batchDialog.heavyText : ""}
          </p>
        )}

        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{sc.batchDialog.orderLabel}</p>
          <ol className="max-h-32 list-decimal space-y-1 overflow-y-auto pl-4 text-xs text-zinc-300">
            {orderedChannelIds(selected, channelOrder).map((id) => {
              const ch = channelById[id];
              return <li key={id}>{ch?.label ?? id}</li>;
            })}
          </ol>
        </div>

        <div>
          <label htmlFor="share-open-tabs" className="mb-1.5 block text-xs text-zinc-500">
            {sc.batchDialog.tabCountLabel}
          </label>
          <Input
            id="share-open-tabs"
            type="number"
            min={1}
            max={tabCap}
            value={dlgOpenTabCount}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setDlgOpenTabCount(clampOpenTabCount(Number.isFinite(v) ? v : 1, tabCap));
            }}
            className="rounded-xl font-mono text-sm"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={dlgCopyRemain}
            onChange={(e) => setDlgCopyRemain(e.target.checked)}
            className="mt-0.5 rounded border-white/20 bg-black/50"
          />
          <span>{sc.batchDialog.copyRemainLabel}</span>
        </label>

        <label className="flex cursor-pointer items-start gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={rememberSkipPreview}
            onChange={(e) => setRememberSkipPreview(e.target.checked)}
            className="mt-0.5 rounded border-white/20 bg-black/50"
          />
          <span>{sc.batchDialog.skipNextLabel}</span>
        </label>

        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <Button type="submit" className="flex-1 rounded-xl font-black">
            {sc.batchDialog.submit}
          </Button>
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            {sc.batchDialog.cancel}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-[11px] text-zinc-500"
          onClick={() => {
            if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(BATCH_PREVIEW_SKIP_KEY);
            toast.message(sc.batchDialog.resetSkipToastTitle, { description: sc.batchDialog.resetSkipToastDesc });
          }}
        >
          {sc.batchDialog.resetSkip}
        </Button>
      </form>
    </dialog>
  );
}
