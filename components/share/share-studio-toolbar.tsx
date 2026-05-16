"use client";

import type * as React from "react";
import type { RefObject } from "react";
import { Download, Eraser, FileUp, Link2, QrCode, Save, Swords, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ShareExportPack } from "@/lib/share-draft";
import type { ShareMessages } from "@/lib/share-trust-copy";
import type { ShareTemplateId } from "@/lib/share-templates";
import { SHARE_DATALAYER_EVENT_SCHEMA, SHARE_UX_LOG_EVENTS } from "@/lib/share-analytics-events";

type Props = {
  sc: ShareMessages;
  debugMode: boolean;
  importInputRef: RefObject<HTMLInputElement | null>;
  onClear: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onImportFile: (f: File) => void;
  onQr: () => void;
  onTemplate: (id: ShareTemplateId) => void;
  onCampaignLatest: () => void;
  onShortLink: () => void;
  shortLinkBusy: boolean;
  cloudName: string;
  setCloudName: (v: string) => void;
  onSaveCloud: () => void;
  cloudTemplates: { id: string; name: string; payload: ShareExportPack }[];
  onLoadCloud: (payload: ShareExportPack) => void;
  onDeleteCloud: (id: string) => void;
};

export function ShareStudioToolbar({
  sc,
  debugMode,
  importInputRef,
  onClear,
  onExport,
  onImportClick,
  onImportFile,
  onQr,
  onTemplate,
  onCampaignLatest,
  onShortLink,
  shortLinkBusy,
  cloudName,
  setCloudName,
  onSaveCloud,
  cloudTemplates,
  onLoadCloud,
  onDeleteCloud
}: Props) {
  return (
    <Card className="mb-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">{sc.tools.title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={() => onTemplate("productLaunch")}>
          <Wand2 className="mr-1.5 h-3.5 w-3.5" /> {sc.templates.productLaunch}
        </Button>
        <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={() => onTemplate("liveStream")}>
          {sc.templates.liveStream}
        </Button>
        <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={onCampaignLatest}>
          <Swords className="mr-1.5 h-3.5 w-3.5" /> {sc.tools.importCampaignLatest}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={onExport}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> {sc.tools.exportJson}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={onImportClick}>
          <FileUp className="mr-1.5 h-3.5 w-3.5" /> {sc.tools.importJson}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={onQr}>
          <QrCode className="mr-1.5 h-3.5 w-3.5" /> {sc.tools.showQr}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="rounded-full text-amber-200/90" onClick={onClear}>
          <Eraser className="mr-1.5 h-3.5 w-3.5" /> {sc.tools.clearData}
        </Button>
        <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={onShortLink} disabled={shortLinkBusy}>
          <Link2 className="mr-1.5 h-3.5 w-3.5" /> {sc.shortLink.create}
        </Button>
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.cloudTemplates.title}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Input
            value={cloudName}
            onChange={(e) => setCloudName(e.target.value)}
            placeholder={sc.cloudTemplates.namePh}
            className="h-9 min-w-[10rem] flex-1 rounded-xl text-sm"
          />
          <Button type="button" size="sm" className="rounded-full" onClick={onSaveCloud}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> {sc.cloudTemplates.save}
          </Button>
        </div>
        {cloudTemplates.length === 0 ? (
          <p className="mt-2 text-[11px] text-zinc-500">{sc.cloudTemplates.empty}</p>
        ) : (
          <ul className="mt-2 max-h-32 space-y-1.5 overflow-y-auto">
            {cloudTemplates.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1.5">
                <span className="truncate text-xs text-zinc-300">{t.name}</span>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-[10px]" onClick={() => onLoadCloud(t.payload)}>
                    {sc.cloudTemplates.load}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-[10px] text-amber-200/90" onClick={() => onDeleteCloud(t.id)}>
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">{sc.cloudTemplates.delete}</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        ref={importInputRef as React.LegacyRef<HTMLInputElement>}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImportFile(f);
          e.target.value = "";
        }}
      />
      {debugMode ? (
        <details className="mt-4 rounded-xl border border-gold/20 bg-black/40 p-3 text-[10px] text-zinc-400">
          <summary className="cursor-pointer font-bold text-gold">{sc.tools.debugEvents}</summary>
          <p className="mt-2 text-zinc-500">{sc.debug.banner}</p>
          <p className="mt-2 font-mono text-zinc-300">event: {SHARE_DATALAYER_EVENT_SCHEMA.event}</p>
          <ul className="mt-1 list-inside list-disc">
            {Object.entries(SHARE_DATALAYER_EVENT_SCHEMA.fields).map(([k, v]) => (
              <li key={k}>
                <span className="text-zinc-200">{k}</span>: {v}
              </li>
            ))}
          </ul>
          <p className="mt-2 font-bold text-zinc-300">shareUxLog</p>
          <ul className="mt-1 max-h-24 overflow-y-auto font-mono text-[9px]">
            {SHARE_UX_LOG_EVENTS.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </Card>
  );
}
