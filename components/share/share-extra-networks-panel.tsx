"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ChannelDef } from "@/components/share/share-channels-config";
import type { ShareMessages } from "@/lib/share-trust-copy";
import type { ReactNode } from "react";

type Props = {
  sc: ShareMessages;
  pinterestMedia: string;
  setPinterestMedia: (v: string) => void;
  mastodonHost: string;
  setMastodonHost: (v: string) => void;
  selectAllExtras: () => void;
  clearExtras: () => void;
  extraChannels: ChannelDef[];
  renderChannelCard: (ch: ChannelDef) => ReactNode;
};

export function ShareExtraNetworksPanel({
  sc,
  pinterestMedia,
  setPinterestMedia,
  mastodonHost,
  setMastodonHost,
  selectAllExtras,
  clearExtras,
  extraChannels,
  renderChannelCard
}: Props) {
  return (
    <>
      <Card className="mb-8 rounded-[2rem] border border-white/10 p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">{sc.extraFieldsHint}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={selectAllExtras}>
              {sc.buttons.selectAllExtras}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-full text-zinc-400" onClick={clearExtras}>
              {sc.buttons.clearExtras}
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-600">{sc.labelPinterest}</label>
            <Input
              value={pinterestMedia}
              onChange={(e) => setPinterestMedia(e.target.value)}
              placeholder={sc.content.phUrl}
              className="rounded-xl font-mono text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-600">{sc.labelMastodon}</label>
            <Input
              value={mastodonHost}
              onChange={(e) => setMastodonHost(e.target.value)}
              placeholder={sc.phMastodon}
              className="rounded-xl font-mono text-xs"
            />
          </div>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{extraChannels.map(renderChannelCard)}</div>
    </>
  );
}
