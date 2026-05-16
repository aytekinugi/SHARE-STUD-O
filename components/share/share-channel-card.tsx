"use client";

import { Check, Copy, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SharePayload } from "@/lib/share-links";
import {
  facebookMarketplaceNewListing,
  instagramAppEntry,
  linkedInShare,
  whatsappSend,
  youtubeUploadPage
} from "@/lib/share-links";
import { normalizeMastodonHost } from "@/lib/share-channel-order";
import { openShareExternal } from "@/lib/share-open-external";
import type { ShareMessages } from "@/lib/share-trust-copy";
import type { ChannelDef } from "@/components/share/share-channels-config";

type Props = {
  ch: ChannelDef;
  sc: ShareMessages;
  isOn: boolean;
  richPayload: SharePayload;
  pinterestMedia: string;
  mastodonHost: string;
  draggingId: string | null;
  onToggle: () => void;
  onCopy: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onChannelOpen?: (channelId: string) => void;
};

function openChannel(href: string, channelId: string, onChannelOpen?: (id: string) => void) {
  if (openShareExternal(href)) onChannelOpen?.(channelId);
}

export function ShareChannelCard({
  ch,
  sc,
  isOn,
  richPayload,
  pinterestMedia,
  mastodonHost,
  draggingId,
  onToggle,
  onCopy,
  onDragStart,
  onDragEnd,
  onDrop,
  onChannelOpen
}: Props) {
  const Icon = ch.icon;

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/10 p-5 text-left transition-all duration-200",
        isOn && "ring-2 ring-gold/70 ring-offset-2 ring-offset-black shadow-[0_0_40px_-8px_rgba(229,184,104,0.45)]",
        !isOn && "opacity-[0.92]",
        draggingId === ch.id && "opacity-60"
      )}
    >
      <div className={cn("pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full blur-3xl", `bg-gradient-to-br ${ch.vibe}`)} aria-hidden />
      <div className="relative flex gap-3">
        <button
          type="button"
          className="mt-1 shrink-0 cursor-grab text-zinc-600 hover:text-zinc-400 active:cursor-grabbing"
          aria-label={sc.dragOrder.hint}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/40",
            isOn && "border-gold/40 bg-gold/15"
          )}
        >
          <Icon className="h-6 w-6 text-gold" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="font-black leading-tight text-white">{ch.label}</span>
            <label className="flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-zinc-500 hover:text-zinc-300">
              <input type="checkbox" checked={isOn} onChange={onToggle} className="peer sr-only" aria-label={`${ch.label} — ${sc.buttons.selectCheckbox}`} />
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-gold",
                  isOn ? "border-gold/50 bg-gold/20 text-gold" : "border-white/10 bg-white/5 text-zinc-500"
                )}
                aria-hidden
              >
                {isOn ? <Check className="h-4 w-4" /> : null}
              </span>
              {sc.buttons.selectCheckbox}
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ch.features.map((f, i) => (
              <span key={`${ch.id}-${i}`} className="rounded-full border border-white/10 bg-black/35 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-300">
                {f}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-3">
            {(ch.id === "ig" || ch.id === "wa" || ch.id === "yt" || ch.id === "fb-mp" || ch.id === "li") && (
              <Button type="button" variant="secondary" size="sm" className="rounded-xl" onClick={onCopy}>
                <Copy className="mr-2 h-3.5 w-3.5" /> {sc.buttons.copyCard}
              </Button>
            )}
            {ch.id === "ig" && (
              <Button type="button" size="sm" className="rounded-xl" onClick={() => openChannel(instagramAppEntry(), ch.id, onChannelOpen)}>
                {sc.cardActions.instagram}
              </Button>
            )}
            {ch.id === "wa" && (
              <Button type="button" size="sm" className="rounded-xl" onClick={() => openChannel(whatsappSend(richPayload), ch.id, onChannelOpen)}>
                {sc.cardActions.whatsappChat}
              </Button>
            )}
            {ch.id === "yt" && (
              <Button type="button" size="sm" className="rounded-xl" onClick={() => openChannel(youtubeUploadPage(), ch.id, onChannelOpen)}>
                {sc.cardActions.youtubeUpload}
              </Button>
            )}
            {ch.id === "fb-mp" && (
              <Button type="button" size="sm" className="rounded-xl" onClick={() => openChannel(facebookMarketplaceNewListing(), ch.id, onChannelOpen)}>
                {sc.cardActions.marketplaceNew}
              </Button>
            )}
            {ch.id === "li" && (
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() => openChannel(linkedInShare(richPayload.url), ch.id, onChannelOpen)}
              >
                {sc.cardActions.linkedinShare}
              </Button>
            )}
            {ch.tier === "extra" && (
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  const href = ch.getUrls({
                    payload: richPayload,
                    pinterestMedia: pinterestMedia.trim() || undefined,
                    mastodonHost: normalizeMastodonHost(mastodonHost)
                  })[0];
                  if (href) openChannel(href, ch.id, onChannelOpen);
                }}
              >
                {sc.cardActions.open}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
