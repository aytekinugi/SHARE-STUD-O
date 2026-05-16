"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShareMessages } from "@/lib/share-trust-copy";

type Props = {
  sc: ShareMessages;
  utmSource: string;
  setUtmSource: (v: string) => void;
  utmMedium: string;
  setUtmMedium: (v: string) => void;
  utmCampaign: string;
  setUtmCampaign: (v: string) => void;
  onApplyDefaults: () => void;
};

export function ShareUtmPanel({
  sc,
  utmSource,
  setUtmSource,
  utmMedium,
  setUtmMedium,
  utmCampaign,
  setUtmCampaign,
  onApplyDefaults
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.utm.title}</p>
        <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg text-[10px]" onClick={onApplyDefaults}>
          {sc.utm.defaults}
        </Button>
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">{sc.utm.hint}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Input value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder={sc.utm.sourcePh} className="h-9 rounded-xl text-xs" />
        <Input value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder={sc.utm.mediumPh} className="h-9 rounded-xl text-xs" />
        <Input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder={sc.utm.campaignPh} className="h-9 rounded-xl text-xs" />
      </div>
    </div>
  );
}
