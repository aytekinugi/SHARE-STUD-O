"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShareExportPack } from "@/lib/share-draft";
import type { ShareMessages } from "@/lib/share-trust-copy";

type GuildTemplate = { id: string; name: string; payload: ShareExportPack };

type Props = {
  sc: ShareMessages;
  guildId: string | null;
  onLoad: (payload: ShareExportPack) => void;
  onBuildPayload: () => ShareExportPack;
};

export function ShareGuildTemplatesPanel({ sc, guildId, onLoad, onBuildPayload }: Props) {
  const [templates, setTemplates] = useState<GuildTemplate[]>([]);
  const [name, setName] = useState("");

  const fetchTemplates = useCallback(async () => {
    if (!guildId) return;
    const res = await fetch(`/api/share/templates/guild?guildId=${encodeURIComponent(guildId)}`, { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as { templates?: GuildTemplate[] };
    setTemplates(data.templates ?? []);
  }, [guildId]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  if (!guildId) return null;

  async function save() {
    const n = name.trim();
    if (!n) return;
    const res = await fetch("/api/share/templates/guild", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId, name: n, payload: onBuildPayload() })
    });
    if (res.status === 403) return;
    if (!res.ok) return;
    setName("");
    await fetchTemplates();
  }

  async function remove(id: string) {
    await fetch(`/api/share/templates/guild?id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
    setTemplates((t) => t.filter((x) => x.id !== id));
  }

  return (
    <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-violet-300">{sc.guildTemplates.title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={sc.guildTemplates.namePh} className="h-9 min-w-[8rem] flex-1 rounded-xl text-sm" />
        <Button type="button" size="sm" className="rounded-full" onClick={() => void save()}>
          <Save className="mr-1.5 h-3.5 w-3.5" /> {sc.guildTemplates.save}
        </Button>
      </div>
      {templates.length === 0 ? (
        <p className="mt-2 text-[11px] text-zinc-500">{sc.guildTemplates.empty}</p>
      ) : (
        <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/8 px-2 py-1">
              <span className="truncate text-xs text-zinc-300">{t.name}</span>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => onLoad(t.payload)}>
                  {sc.guildTemplates.load}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-amber-200/90" onClick={() => void remove(t.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
