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
  type ShareDraftV1,
  type ShareExportPack
} from "@/lib/share-draft";
import { channelSnippetsForSelection } from "@/lib/share-channel-snippets";
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
import { appendUtmParams, defaultUtmForQuest } from "@/lib/share-utm";
import { recordChannelOpen as persistChannelOpen, unopenedSelectedChannels } from "@/lib/share-channel-opens";
import { limitsForPlan, type SharePlan } from "@/lib/share-premium";
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
  textB: string;
  activeVariant: "a" | "b";
  url: string;
  hashtags: string;
  cta: string;
  warmClose: boolean;
  mastodonHost: string;
  pinterestMedia: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  selected: Set<string>;
  channelOrder: string[];
}): Omit<ShareDraftV1, "v"> {
  return {
    title: state.title,
    text: state.text,
    textB: state.textB || undefined,
    activeVariant: state.activeVariant,
    url: state.url,
    hashtags: state.hashtags,
    cta: state.cta,
    warmClose: state.warmClose,
    mastodonHost: state.mastodonHost,
    pinterestMedia: state.pinterestMedia,
    utmSource: state.utmSource || undefined,
    utmMedium: state.utmMedium || undefined,
    utmCampaign: state.utmCampaign || undefined,
    selectedIds: [...state.selected],
    channelOrder: [...state.channelOrder]
  };
}

function applyDraft(
  draft: Omit<ShareDraftV1, "v">,
  setters: {
    setTitle: (v: string) => void;
    setText: (v: string) => void;
    setTextB: (v: string) => void;
    setActiveVariant: (v: "a" | "b") => void;
    setUrl: (v: string) => void;
    setHashtags: (v: string) => void;
    setCta: (v: string) => void;
    setWarmClose: (v: boolean) => void;
    setMastodonHost: (v: string) => void;
    setPinterestMedia: (v: string) => void;
    setUtmSource: (v: string) => void;
    setUtmMedium: (v: string) => void;
    setUtmCampaign: (v: string) => void;
    setSelected: (v: Set<string>) => void;
    setChannelOrder: (v: string[]) => void;
  }
) {
  setters.setTitle(draft.title);
  setters.setText(draft.text);
  setters.setTextB(draft.textB ?? "");
  setters.setActiveVariant(draft.activeVariant === "b" ? "b" : "a");
  setters.setUrl(draft.url);
  setters.setHashtags(draft.hashtags);
  setters.setCta(draft.cta);
  setters.setWarmClose(draft.warmClose);
  setters.setMastodonHost(draft.mastodonHost);
  setters.setPinterestMedia(draft.pinterestMedia);
  setters.setUtmSource(draft.utmSource ?? "vanguard");
  setters.setUtmMedium(draft.utmMedium ?? "share");
  setters.setUtmCampaign(draft.utmCampaign ?? "");
  setters.setSelected(new Set(draft.selectedIds));
  setters.setChannelOrder(draft.channelOrder);
}

export function useShareStudioState() {
  const [locale, setLocale] = useState<ShareLocale>("tr");
  const sc = useMemo(() => getShareMessages(locale), [locale]);
  const [hydrated, setHydrated] = useState(false);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [textB, setTextB] = useState("");
  const [activeVariant, setActiveVariant] = useState<"a" | "b">("a");
  const [url, setUrl] = useState("");
  const [utmSource, setUtmSource] = useState("vanguard");
  const [utmMedium, setUtmMedium] = useState("share");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [questId, setQuestId] = useState<string | undefined>();
  const [plan, setPlan] = useState<SharePlan>("free");
  const [batchMaxTabs, setBatchMaxTabs] = useState(5);
  const [guildId, setGuildId] = useState<string | null>(null);
  const [channelOpenTick, setChannelOpenTick] = useState(0);
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
  const [cloudTemplates, setCloudTemplates] = useState<{ id: string; name: string; payload: ShareExportPack }[]>([]);
  const [cloudName, setCloudName] = useState("");
  const [shortLinkBusy, setShortLinkBusy] = useState(false);

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
        const row = data as { title?: string; text?: string; url?: string; hashtags?: string; questId?: string };
        if (row.title) setTitle(row.title);
        if (row.text) setText(row.text);
        if (row.url) setUrl(row.url);
        if (row.hashtags) setHashtags(row.hashtags);
        if (row.questId) {
          setQuestId(row.questId);
          const utm = defaultUtmForQuest(row.questId);
          setUtmCampaign(utm.campaign ?? "");
        }
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
        setTextB,
        setActiveVariant,
        setUrl,
        setHashtags,
        setCta,
        setWarmClose,
        setMastodonHost,
        setPinterestMedia,
        setUtmSource,
        setUtmMedium,
        setUtmCampaign,
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
    if (q.questId) {
      setQuestId(q.questId);
      const utm = defaultUtmForQuest(q.questId);
      setUtmCampaign(utm.campaign ?? "");
      void importCampaign(q.questId);
    }
  }, [hydrated, importCampaign, setLocalePersist]);

  useEffect(() => {
    if (!hydrated) return;
    void (async () => {
      try {
        const [limitsRes, guildRes] = await Promise.all([
          fetch("/api/share/limits", { credentials: "include" }),
          fetch("/api/guilds", { credentials: "include" })
        ]);
        if (limitsRes.ok) {
          const data = (await limitsRes.json()) as { plan?: SharePlan; limits?: { batchMaxTabs: number } };
          if (data.plan) setPlan(data.plan);
          if (data.limits?.batchMaxTabs) setBatchMaxTabs(data.limits.batchMaxTabs);
        }
        if (guildRes.ok) {
          const g = (await guildRes.json()) as { guild?: { id: string } | null };
          setGuildId(g.guild?.id ?? null);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      writeShareDraft(
        draftSnapshot({
          title,
          text,
          textB,
          activeVariant,
          url,
          hashtags,
          cta,
          warmClose,
          mastodonHost,
          pinterestMedia,
          utmSource,
          utmMedium,
          utmCampaign,
          selected,
          channelOrder
        })
      );
      shareUxLog("draft_saved", { chars: text.length });
    }, 400);
    return () => window.clearTimeout(t);
  }, [
    hydrated,
    title,
    text,
    textB,
    activeVariant,
    url,
    hashtags,
    cta,
    warmClose,
    mastodonHost,
    pinterestMedia,
    utmSource,
    utmMedium,
    utmCampaign,
    selected,
    channelOrder
  ]);

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

  const bodyText = activeVariant === "b" && textB.trim() ? textB : text;

  const shareUrl = useMemo(() => {
    const raw = url.trim() || `${typeof window !== "undefined" ? window.location.origin : ""}/share`;
    return appendUtmParams(raw, {
      source: utmSource.trim() || "vanguard",
      medium: utmMedium.trim() || "share",
      campaign: utmCampaign.trim() || defaultUtmForQuest(questId).campaign
    });
  }, [url, utmSource, utmMedium, utmCampaign, questId]);

  const basePayload = useMemo<SharePayload>(
    () => ({
      title: title.trim() || undefined,
      text: bodyText.trim() || sc.defaultBody,
      url: shareUrl
    }),
    [title, bodyText, shareUrl, sc]
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

  const channelSnippets = useMemo(
    () => channelSnippetsForSelection(richPayload, selected, channelLabels),
    [richPayload, selected, channelLabels]
  );

  const fetchCloudTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/share/templates", { credentials: "include" });
      if (res.status === 401) return;
      if (!res.ok) return;
      const data = (await res.json()) as {
        templates?: { id: string; name: string; payload: ShareExportPack }[];
      };
      setCloudTemplates(data.templates ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void fetchCloudTemplates();
  }, [hydrated, fetchCloudTemplates]);

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

  const unopenedLabels = useMemo(() => {
    void channelOpenTick;
    const ids = unopenedSelectedChannels(selected);
    return ids.map((id) => channelLabels[id] ?? id);
  }, [selected, channelLabels, channelOpenTick]);

  const recordChannelOpen = useCallback((channelId: string) => {
    persistChannelOpen(channelId);
    setChannelOpenTick((n) => n + 1);
  }, []);

  const batch = useShareBatch({ sc, assembled, selected, gatherHrefList, batchMaxTabs });

  const buildExportPack = useCallback(
    () =>
      buildShareExportPack(
        draftSnapshot({
          title,
          text,
          textB,
          activeVariant,
          url,
          hashtags,
          cta,
          warmClose,
          mastodonHost,
          pinterestMedia,
          utmSource,
          utmMedium,
          utmCampaign,
          selected,
          channelOrder
        })
      ),
    [
      title,
      text,
      textB,
      activeVariant,
      url,
      hashtags,
      cta,
      warmClose,
      mastodonHost,
      pinterestMedia,
      utmSource,
      utmMedium,
      utmCampaign,
      selected,
      channelOrder
    ]
  );

  const applyUtmDefaults = useCallback(() => {
    const utm = defaultUtmForQuest(questId);
    setUtmSource(utm.source ?? "vanguard");
    setUtmMedium(utm.medium ?? "share");
    setUtmCampaign(utm.campaign ?? "");
  }, [questId]);

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
    setTextB("");
    setActiveVariant("a");
    setUrl("");
    setUtmSource("vanguard");
    setUtmMedium("share");
    setUtmCampaign("");
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
    const pack = buildExportPack();
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
        setTextB,
        setActiveVariant,
        setUrl,
        setHashtags,
        setCta,
        setWarmClose,
        setMastodonHost,
        setPinterestMedia,
        setUtmSource,
        setUtmMedium,
        setUtmCampaign,
        setSelected,
        setChannelOrder
      });
      shareUxLog("pack_imported");
      toast.success(sc.tools.importOk);
    };
    reader.readAsText(file);
  }

  async function createShortLink() {
    const target = url.trim() || richPayload.url;
    if (!target) {
      toast.message(sc.shortLink.fail);
      return;
    }
    setShortLinkBusy(true);
    try {
      const res = await fetch("/api/short", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target })
      });
      if (res.status === 401) {
        toast.message(sc.shortLink.login);
        return;
      }
      if (res.status === 403) {
        toast.message(sc.premium.shortLinkLimit);
        return;
      }
      if (!res.ok) {
        toast.error(sc.shortLink.fail);
        return;
      }
      const data = (await res.json()) as { shortUrl?: string };
      if (!data.shortUrl) {
        toast.error(sc.shortLink.fail);
        return;
      }
      const ok = await writeClipboardPreferApi(data.shortUrl);
      if (ok) toast.success(sc.shortLink.created, { description: data.shortUrl });
      else toast.success(sc.shortLink.created, { description: data.shortUrl });
      setUrl(data.shortUrl);
    } catch {
      toast.error(sc.shortLink.fail);
    } finally {
      setShortLinkBusy(false);
    }
  }

  async function saveCloudTemplate() {
    const name = cloudName.trim();
    if (!name) return;
    try {
      const pack = buildExportPack();
      const res = await fetch("/api/share/templates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, payload: pack })
      });
      if (res.status === 401) {
        toast.message(sc.cloudTemplates.login);
        return;
      }
      if (res.status === 403) {
        toast.message(sc.premium.templateLimit);
        return;
      }
      if (!res.ok) {
        toast.error(sc.tools.importFail);
        return;
      }
      setCloudName("");
      await fetchCloudTemplates();
      shareUxLog("cloud_template_saved");
      toast.success(sc.cloudTemplates.saved);
    } catch {
      toast.error(sc.tools.importFail);
    }
  }

  function loadCloudTemplate(payload: ShareExportPack) {
    if (payload.v !== 1) return;
    applyDraft(payload, {
      setTitle,
      setText,
      setTextB,
      setActiveVariant,
      setUrl,
      setHashtags,
      setCta,
      setWarmClose,
      setMastodonHost,
      setPinterestMedia,
      setUtmSource,
      setUtmMedium,
      setUtmCampaign,
      setSelected,
      setChannelOrder
    });
    shareUxLog("cloud_template_loaded");
    toast.success(sc.cloudTemplates.loaded);
  }

  async function deleteCloudTemplate(id: string) {
    try {
      const res = await fetch(`/api/share/templates?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) return;
      setCloudTemplates((t) => t.filter((x) => x.id !== id));
      shareUxLog("cloud_template_deleted");
      toast.success(sc.cloudTemplates.deleted);
    } catch {
      /* ignore */
    }
  }

  function applyTemplate(id: ShareTemplateId) {
    const tpl = SHARE_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    applyDraft(tpl.apply(locale), {
      setTitle,
      setText,
      setTextB,
      setActiveVariant,
      setUrl,
      setHashtags,
      setCta,
      setWarmClose,
      setMastodonHost,
      setPinterestMedia,
      setUtmSource,
      setUtmMedium,
      setUtmCampaign,
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
    textB,
    setTextB,
    activeVariant,
    setActiveVariant,
    url,
    setUrl,
    shareUrl,
    utmSource,
    setUtmSource,
    utmMedium,
    setUtmMedium,
    utmCampaign,
    setUtmCampaign,
    applyUtmDefaults,
    plan,
    batchMaxTabs,
    guildId,
    buildExportPack,
    unopenedLabels,
    recordChannelOpen,
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
    channelSnippets,
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
    createShortLink,
    shortLinkBusy,
    cloudTemplates,
    cloudName,
    setCloudName,
    saveCloudTemplate,
    loadCloudTemplate,
    deleteCloudTemplate,
    debugMode,
    batch,
    interpolateShare
  };
}
