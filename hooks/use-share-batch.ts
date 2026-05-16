"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  clampOpenTabCount,
  dedupeUrlsOrdered,
  formatRemainingUrlsForClipboard
} from "@/lib/share-channel-order";
import { pushShareDataLayer } from "@/lib/share-analytics";
import { openShareExternal } from "@/lib/share-open-external";
import { shareUxLog } from "@/lib/share-observability";
import { syncCopyToClipboard, writeClipboardPreferApi } from "@/lib/share-clipboard";
import { interpolateShare } from "@/lib/share-template";
import type { ShareMessages } from "@/lib/share-trust-copy";

export const BATCH_PREVIEW_SKIP_KEY = "vanguard-share-skip-batch-preview";

type UseShareBatchOpts = {
  sc: ShareMessages;
  assembled: string;
  selected: Set<string>;
  gatherHrefList: () => string[];
  batchMaxTabs?: number;
};

export function useShareBatch({ sc, assembled, selected, gatherHrefList, batchMaxTabs = 5 }: UseShareBatchOpts) {
  const [batchBusy, setBatchBusy] = useState(false);
  const batchDialogRef = useRef<HTMLDialogElement | null>(null);
  const batchReturnFocusRef = useRef<HTMLElement | null>(null);
  const previewPackRef = useRef<{ urls: string[]; assembled: string; channelCount: number } | null>(null);

  const [dlgUrlTotal, setDlgUrlTotal] = useState(0);
  const [dlgPreviewUrls, setDlgPreviewUrls] = useState<string[]>([]);
  const [dlgOpenTabCount, setDlgOpenTabCount] = useState(5);
  const [dlgCopyRemain, setDlgCopyRemain] = useState(true);
  const [rememberSkipPreview, setRememberSkipPreview] = useState(false);

  useLayoutEffect(() => {
    const d = batchDialogRef.current;
    if (!d) return;
    const onClose = () => {
      batchReturnFocusRef.current?.focus?.();
      batchReturnFocusRef.current = null;
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const executeBatchImmediate = useCallback(
    (openTabsRaw: number, copyRemainderUrls: boolean, persistSkipPreference: boolean) => {
      if (batchBusy) return;

      batchDialogRef.current?.close();

      const pack = previewPackRef.current;
      if (!pack) return;

      const uniqueHrefs = dedupeUrlsOrdered(pack.urls);
      const urlTotal = uniqueHrefs.length;
      if (urlTotal === 0) {
        toast.error(sc.toasts.noHref);
        return;
      }

      if (persistSkipPreference && typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(BATCH_PREVIEW_SKIP_KEY, "1");
      }

      const channelCount = pack.channelCount;
      const assembledBody = pack.assembled;

      const openN = clampOpenTabCount(openTabsRaw, urlTotal);
      const slice = uniqueHrefs.slice(0, openN);
      const rest = uniqueHrefs.slice(openN);

      shareUxLog("batch_execute", {
        channels: channelCount,
        urls: urlTotal,
        openTabs: openN,
        remainderUrls: rest.length,
        deferRemainderClipboard: !!(copyRemainderUrls && rest.length > 0),
        assembledChars: assembledBody.length
      });

      pushShareDataLayer({
        channels: channelCount,
        url_count: urlTotal,
        open_tabs: openN,
        remainder_count: rest.length,
        defer_remainder_clipboard: !!(copyRemainderUrls && rest.length > 0),
        assembled_chars: assembledBody.length
      });

      if (assembledBody.length > 5200) {
        toast.message(sc.toasts.longTextTitle, { description: sc.toasts.longTextDesc });
      }

      const synced = syncCopyToClipboard(assembledBody);
      if (!synced) shareUxLog("clipboard_sync_exec_command_false", {});
      void writeClipboardPreferApi(assembledBody).then((ok) => {
        if (!ok) shareUxLog("clipboard_write_api_failed_main", {});
      });

      let blockedTabs = 0;
      if (slice[0] && !openShareExternal(slice[0])) blockedTabs += 1;
      for (let i = 1; i < slice.length; i++) {
        const href = slice[i];
        window.setTimeout(() => {
          if (href && !openShareExternal(href)) blockedTabs += 1;
        }, i * 180);
      }
      if (slice.length > 0) {
        window.setTimeout(() => {
          if (blockedTabs > 0) {
            shareUxLog("popup_blocker_detected", { blocked: blockedTabs, attempted: slice.length });
            toast.message(sc.toasts.popupBlockedTitle, {
              description: interpolateShare(sc.toasts.popupBlockedDesc, {
                blocked: blockedTabs,
                total: slice.length
              }),
              duration: 7000
            });
          }
        }, Math.max(400, slice.length * 200));
      }

      const copyRemainder = copyRemainderUrls && rest.length > 0;
      const pauseBeforeUrlListMs = Math.min(9500, 900 + slice.length * 190 + (copyRemainder ? 2800 : 0));

      if (copyRemainder) {
        const restBlock = formatRemainingUrlsForClipboard(rest);
        window.setTimeout(() => {
          void writeClipboardPreferApi(restBlock).then((ok) => {
            if (!ok) shareUxLog("clipboard_write_api_failed_remainder", { count: rest.length });
            toast.message(sc.toasts.remainderTitle, {
              description: `${rest.length} URL — ${sc.toasts.remainderDesc}`
            });
          });
        }, pauseBeforeUrlListMs);
      }

      const releaseMs = Math.min(9500, 650 + Math.max(0, slice.length - 1) * 180 + 550 + (copyRemainder ? 900 : 0));
      setBatchBusy(true);
      window.setTimeout(() => setBatchBusy(false), releaseMs);

      const seconds = Math.round(pauseBeforeUrlListMs / 100) / 10;
      const desc = synced
        ? copyRemainder
          ? interpolateShare(sc.toasts.batchSentDescSyncedRemainder, {
              channelCount,
              openTabs: slice.length,
              seconds,
              restCount: rest.length
            })
          : interpolateShare(sc.toasts.batchSentDescSynced, {
              channelCount,
              openTabs: slice.length
            })
        : interpolateShare(sc.toasts.batchSentDescUnsynced, {
            channelCount,
            openTabs: slice.length
          });

      toast.success(sc.toasts.batchSent, {
        description: desc,
        duration: copyRemainder ? 7500 : 5500
      });
    },
    [batchBusy, sc]
  );

  const requestBatch = useCallback(() => {
    if (batchBusy) return;

    if (selected.size === 0) {
      toast.error(sc.toasts.noChannels, { description: sc.toasts.noChannelsDesc });
      return;
    }

    const hrefList = gatherHrefList();
    const uniqueHrefs = dedupeUrlsOrdered(hrefList);
    if (uniqueHrefs.length === 0) {
      shareUxLog("href_list_empty_after_selection");
      toast.error(sc.toasts.noHrefGen, { description: sc.toasts.noHrefGenDesc });
      return;
    }

    previewPackRef.current = { urls: [...uniqueHrefs], assembled, channelCount: selected.size };
    const urlTotal = uniqueHrefs.length;
    const sensibleOpen = clampOpenTabCount(Math.min(batchMaxTabs, urlTotal), urlTotal);

    setDlgUrlTotal(urlTotal);
    setDlgPreviewUrls([...uniqueHrefs]);
    setDlgOpenTabCount(sensibleOpen);
    setDlgCopyRemain(urlTotal > sensibleOpen);
    setRememberSkipPreview(false);

    const heavy = assembled.length > 5200 || urlTotal > 6;
    const skipPreview =
      typeof sessionStorage !== "undefined" && sessionStorage.getItem(BATCH_PREVIEW_SKIP_KEY) === "1";

    if (!heavy && skipPreview) {
      executeBatchImmediate(sensibleOpen, urlTotal > sensibleOpen, false);
      return;
    }

    batchReturnFocusRef.current = document.activeElement as HTMLElement | null;
    batchDialogRef.current?.showModal();
    queueMicrotask(() => {
      batchDialogRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus();
    });
  }, [assembled, batchBusy, batchMaxTabs, executeBatchImmediate, gatherHrefList, sc, selected.size]);

  return {
    batchBusy,
    batchDialogRef,
    dlgUrlTotal,
    dlgPreviewUrls,
    dlgOpenTabCount,
    setDlgOpenTabCount,
    dlgCopyRemain,
    setDlgCopyRemain,
    rememberSkipPreview,
    setRememberSkipPreview,
    executeBatchImmediate,
    requestBatch
  };
}
