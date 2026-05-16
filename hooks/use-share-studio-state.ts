"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { SharePayload } from "@/lib/share-links";
import { composeShareBody } from "@/lib/share-links";
import {
  clipboardSnippetsLikelyMatch,
  DEFAULT_CHANNEL_ORDER,
  normalizeMastodonHost,
  orderedChannelIds,
  readStoredChannelOrder,
  reorderChannelIds,
  writeStoredChannelOrder
} from "@/lib/share-channel-order";
import { channelLimitWarnings } from "@/lib/share-channel-limits";
import {
  buildShareExportPack,
  clearAllShareStorage,
  parseShareExportPack,
  readShareDraft,
  writeShareDraft,
  type ShareDraftV1
} from "@/lib/share-draft";
import {
  getShareMessages,
  inferBrowserShareLocale,
  readStoredShareLocale,
  type ShareLocale,
  SHARE_SELECTED_IDS_KEY,
  writeStoredShareLocale
} from "@/lib/share-i18n";
import { parseShareQueryPrefill } from "@/lib/share-query-prefill";
import { SHARE_TEMPLATES, type ShareTemplateId } from "@/lib/share-templates";
import { readClipboardText, writeClipboardPreferApi } from "@/lib/share-clipboard";
import { isShareDebugMode } from "@/lib/share-analytics";
import { shareUxLog } from "@/lib/share-observability";
import { interpolateShare } from "@/lib/share-template";
import { useShareBatch } from "@/hooks/use-share-batch";
import {
  ALL_CHANNEL_IDS,
  CHANNEL_BY_ID,
  DEFAULT_SELECTED,
  EXTRA_CHANNELS,
  PRIMARY_CHANNELS,
  type ChannelDef
} from "@/components/share/share-channels-config";

function sortChannelsByOrder(channels: ChannelDef[], order: string[]): ChannelDef[] {
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...channels].sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
}

function draftSnapshot(state: {
  title: string;
  text: string;
  url: string;
  hashtags: string;
  cta: string;
  warmClose: boolean;
  mastodonHost: string;
  pinterestMedia: string;
  selected: Set<string>;
  channelOrder: string[];
}): Omit<ShareDraftV1, "v"> {
  return {
    title: state.title,
    text: state.text,
    url: state.url,
    hashtags: state.hashtags,
    cta: state.cta,
    warmClose: state.warmClose,
    mastodonHost: state.mastodonHost,
    pinterestMedia: state.pinterestMedia,
    selectedIds: [...state.selected],
    channelOrder: [...state.channelOrder]
  };
}

function applyDraft(
  draft: Omit<ShareDraftV1, "v">,
  setters: {
    setTitle: (v: string) => void;
    setText: (v: string) => void;
    setUrl: (v: string) => void;
    setHashtags: (v: string) => void;
    setCta: (v: string) => void;
    setWarmClose: (v: boolean) => void;
    setMastodonHost: (v: string) => void;
    setPinterestMedia: (v: string) => void;
    setSelected: (v: Set<string>) => void;
    setChannelOrder: (v: string[]) => void;
  }
) {
  setters.setTitle(draft.title);
  setters.setText(draft.text);
  setters.setUrl(draft.url);
  setters.setHashtags(draft.hashtags);
  setters.setCta(draft.cta);
  setters.setWarmClose(draft.warmClose);
  setters.setMastodonHost(draft.mastodonHost);
  setters.setPinterestMedia(draft.pinterestMedia);
  setters.setSelected(new Set(draft.selectedIds));
  setters.setChannelOrder(draft.channelOrder);
}

export function useShareStudioState() {
  const [locale, setLocale] = useState<ShareLocale>("tr");
  const sc = useMemo(() => getShareMessages(locale), [locale]);
  const [hydrated, setHydrated] = useState(false);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [cta, setCta] = useState("");
  const [warmClose, setWarmClose] = useState(true);
  const [mastodonHost, setMastodonHost] = useState("mastodon.social");
  const [pinterestMedia, setPinterestMedia] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(DEFAULT_SELECTED));
  const [channelOrder, setChannelOrder] = useState<string[]>(() => [...DEFAULT_CHANNEL_ORDER]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [nativeBusy, setNativeBusy] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const prefillDoneRef = useRef(false);

  const importCampaign = useCallback(
    async (questId?: string) => {
      const q = questId ? `?questId=${encodeURIComponent(questId)}` : "";
      try {
        const res = await fetch(`/api/share/campaign${q}`, { credentials: "include" });
        if (res.status === 401) {
          toast.message(sc.tools.campaignLogin);
          return;
        }
        if (!res.ok) {
          toast.error(sc.tools.campaignFail);
          return;
        }
        const data = (await res.json()) as { title?: string; text?: string; url?: string };
        if (data.title) setTitle(data.title);
        if (data.text) setText(data.text);
        if (data.url) setUrl(data.url);
        shareUxLog("campaign_imported", { questId: questId ?? "latest" });
        toast.success(sc.tools.campaignOk);
      } catch {
        toast.error(sc.tools.campaignFail);
      }
    },
    [sc]
  );

  const channelLabels = useMemo(() => sc.channelLabels as Record<string, string>, [sc]);

  const setLocalePersist = useCallback((loc: ShareLocale) => {
    setLocale(loc);
    writeStoredShareLocale(loc);
  }, []);

  useEffect(() => {
    setLocale(readStoredShareLocale() ?? inferBrowserShareLocale());
    const storedOrder = readStoredChannelOrder();
    if (storedOrder) setChannelOrder(storedOrder);

    const draft = readShareDraft();
    if (draft) {
      applyDraft(draft, {
        setTitle,
        setText,
        setUrl,
        setHashtags,
        setCta,
        setWarmClose,
        setMastodonHost,
        setPinterestMedia,
        setSelected,
        setChannelOrder
      });
      shareUxLog("draft_restored");
    } else {
      try {
        const raw = window.localStorage.getItem(SHARE_SELECTED_IDS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            const valid = new Set(ALL_CHANNEL_IDS);
            const next = new Set<string>();
            for (const id of parsed) {
              if (typeof id === "string" && valid.has(id)) next.add(id);
            }
            if (next.size > 0) setSelected(next);
          }
        }
      } catch {
        /* ignore */
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || prefillDoneRef.current) return;
    prefillDoneRef.current = true;
    const q = parseShareQueryPrefill(window.location.search);
    if (q.title) setTitle(q.title);
    if (q.text) setText(q.text);
    if (q.url) setUrl(q.url);
    if (q.hashtags) setHashtags(q.hashtags);
    if (q.cta) setCta(q.cta);
    if (q.lang === "en" || q.lang === "tr") setLocalePersist(q.lang);
    if (q.questId) void importCampaign(q.questId);
  }, [hydrated, importCampaign, setLocalePersist]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      writeShareDraft(
        draftSnapshot({ title, text, url, hashtags, cta, warmClose, mastodonHost, pinterestMedia, selected, channelOrder })
      );
      shareUxLog("draft_saved", { chars: text.length });
    }, 400);
    return () => window.clearTimeout(t);
  }, [hydrated, title, text, url, hashtags, cta, warmClose, mastodonHost, pinterestMedia, selected, channelOrder]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SHARE_SELECTED_IDS_KEY, JSON.stringify([...selected]));
      writeStoredChannelOrder(channelOrder);
    } catch {
      /* ignore */
    }
  }, [hydrated, selected, channelOrder]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = sc.page.metaTitle;
  }, [sc.page.metaTitle]);

  const basePayload = useMemo<SharePayload>(
    () => ({
      title: title.trim() || undefined,
      text: text.trim() || sc.defaultBody,
      url: url.trim() || `${typeof window !== "undefined" ? window.location.origin : ""}/share`
    }),
    [title, text, url, sc]
  );

  const richPayload = useMemo<SharePayload>(() => {
    const pieces = [basePayload.text.trim()];
    if (hashtags.trim()) pieces.push(hashtags.trim());
    if (cta.trim()) pieces.push(cta.trim());
    let body = pieces.join("\n\n");
    if (warmClose && !body.endsWith("✨")) body = `${body}\n\n✨`;
    return { ...basePayload, text: body };
  }, [basePayload, hashtags, cta, warmClose]);

  const assembled = useMemo(() => composeShareBody(richPayload), [richPayload]);

  const limitWarnings = useMemo(
    () => channelLimitWarnings(assembled.length, selected, channelLabels),
    [assembled.length, selected, channelLabels]
  );

  const tipsById = useMemo(() => sc.contextualTips as Record<string, string>, [sc]);
  const copyMsg = useMemo(() => sc.clipboardCopyMessages as Record<string, string>, [sc]);

  const contextualTips = useMemo(() => {
    const out: string[] = [];
    for (const id of orderedChannelIds(selected, channelOrder)) {
      const t = tipsById[id];
      if (t) out.push(t);
    }
    return out.slice(0, 9);
  }, [selected, channelOrder, tipsById]);

  const sortedPrimary = useMemo(() => sortChannelsByOrder(PRIMARY_CHANNELS, channelOrder), [channelOrder]);
  const sortedExtra = useMemo(() => sortChannelsByOrder(EXTRA_CHANNELS, channelOrder), [channelOrder]);

  const gatherHrefList = useCallback((): string[] => {
    const ctx = {
      payload: richPayload,
      pinterestMedia: pinterestMedia.trim() || undefined,
      mastodonHost: normalizeMastodonHost(mastodonHost)
    };
    const hrefList: string[] = [];
    for (const id of orderedChannelIds(selected, channelOrder)) {
      const ch = CHANNEL_BY_ID[id];
      if (!ch) continue;
      try {
        hrefList.push(...ch.getUrls(ctx));
      } catch {
        /* skip */
      }
    }
    return hrefList;
  }, [richPayload, mastodonHost, pinterestMedia, selected, channelOrder]);

  const batch = useShareBatch({ sc, assembled, selected, gatherHrefList });

  const toggleChannel = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllPrimary = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      PRIMARY_CHANNELS.forEach((c) => next.add(c.id));
      return next;
    });
  }, []);

  const clearPrimary = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      PRIMARY_CHANNELS.forEach((c) => next.delete(c.id));
      return next;
    });
  }, []);

  const selectAllExtras = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      EXTRA_CHANNELS.forEach((c) => next.add(c.id));
      return next;
    });
  }, []);

  const clearExtras = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      EXTRA_CHANNELS.forEach((c) => next.delete(c.id));
      return next;
    });
  }, []);

  const onChannelDragStart = useCallback((id: string) => setDraggingId(id), []);
  const onChannelDragEnd = useCallback(() => setDraggingId(null), []);
  const onChannelDrop = useCallback(
    (targetId: string) => {
      if (!draggingId) return;
      setChannelOrder((prev) => reorderChannelIds(prev, draggingId, targetId));
      setDraggingId(null);
    },
    [draggingId]
  );

  const resetChannelOrder = useCallback(() => {
    setChannelOrder([...DEFAULT_CHANNEL_ORDER]);
    shareUxLog("channel_order_reset");
    toast.success(sc.dragOrder.resetDone);
  }, [sc]);

  async function copyToClipboard(message: string) {
    const ok = await writeClipboardPreferApi(assembled);
    if (!ok) shareUxLog("clipboard_copy_button_failed");
    if (ok) toast.success(message);
    else toast.error(sc.toasts.copyFailTitle, { description: sc.toasts.copyFailDesc });
  }

  async function nativeShare() {
    if (!navigator.share) {
      toast.message(sc.toasts.nativeNoneTitle, { description: sc.toasts.nativeNoneDesc });
      return;
    }
    setNativeBusy(true);
    try {
      await navigator.share({
        title: richPayload.title ?? sc.nativeShareDefaultTitle,
        text: [richPayload.title, richPayload.text].filter(Boolean).join("\n\n"),
        url: richPayload.url
      });
      toast.success(sc.toasts.nativeOk);
    } catch {
      /* cancelled */
    }
    setNativeBusy(false);
  }

  async function verifyClipboardSnippet() {
    const read = await readClipboardText();
    if (read === null) {
      shareUxLog("clipboard_read_denied_or_unsupported");
      toast.error(sc.toasts.clipboardReadFail, { description: sc.toasts.clipboardReadFailDesc });
      return;
    }
    const ok = clipboardSnippetsLikelyMatch(assembled, read, 280);
    if (!ok) shareUxLog("clipboard_verify_mismatch", { assembledLen: assembled.length, readLen: read.length });
    if (ok) toast.success(sc.toasts.clipboardOk, { description: sc.toasts.clipboardOkDesc });
    else toast.message(sc.toasts.clipboardDiff, { description: sc.toasts.clipboardDiffDesc });
  }

  function clearAllData() {
    clearAllShareStorage();
    setTitle("");
    setText("");
    setUrl("");
    setHashtags("");
    setCta("");
    setWarmClose(true);
    setMastodonHost("mastodon.social");
    setPinterestMedia("");
    setSelected(new Set(DEFAULT_SELECTED));
    setChannelOrder([...DEFAULT_CHANNEL_ORDER]);
    shareUxLog("data_cleared");
    toast.success(sc.tools.clearDataDone);
  }

  function exportJson() {
    const pack = buildShareExportPack(
      draftSnapshot({ title, text, url, hashtags, cta, warmClose, mastodonHost, pinterestMedia, selected, channelOrder })
    );
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vanguard-share-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    shareUxLog("pack_exported");
  }

  function triggerImport() {
    importInputRef.current?.click();
  }

  function onImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const pack = parseShareExportPack(String(reader.result ?? ""));
      if (!pack) {
        toast.error(sc.tools.importFail);
        return;
      }
      applyDraft(pack, {
        setTitle,
        setText,
        setUrl,
        setHashtags,
        setCta,
        setWarmClose,
        setMastodonHost,
        setPinterestMedia,
        setSelected,
        setChannelOrder
      });
      shareUxLog("pack_imported");
      toast.success(sc.tools.importOk);
    };
    reader.readAsText(file);
  }

  function applyTemplate(id: ShareTemplateId) {
    const tpl = SHARE_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    applyDraft(tpl.apply(locale), {
      setTitle,
      setText,
      setUrl,
      setHashtags,
      setCta,
      setWarmClose,
      setMastodonHost,
      setPinterestMedia,
      setSelected,
      setChannelOrder
    });
    shareUxLog("template_applied", { id });
    toast.success(sc.templates.applied);
  }

  const debugMode = isShareDebugMode();

  return {
    sc,
    locale,
    setLocalePersist,
    hydrated,
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
    mastodonHost,
    setMastodonHost,
    pinterestMedia,
    setPinterestMedia,
    selected,
    moreOpen,
    setMoreOpen,
    nativeBusy,
    qrOpen,
    setQrOpen,
    draggingId,
    channelOrder,
    assembled,
    richPayload,
    limitWarnings,
    contextualTips,
    copyMsg,
    sortedPrimary,
    sortedExtra,
    toggleChannel,
    selectAllPrimary,
    clearPrimary,
    selectAllExtras,
    clearExtras,
    onChannelDragStart,
    onChannelDragEnd,
    onChannelDrop,
    resetChannelOrder,
    copyToClipboard,
    nativeShare,
    verifyClipboardSnippet,
    clearAllData,
    exportJson,
    triggerImport,
    onImportFile,
    importInputRef,
    applyTemplate,
    importCampaign,
    debugMode,
    batch,
    interpolateShare
  };
}
