"use client";

import type { ShareMessages } from "@/lib/share-trust-copy";

type Props = {
  sc: ShareMessages;
  title: string;
  description: string;
  url: string;
};

export function ShareSocialPreview({ sc, title, description, url }: Props) {
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url || "vanguard.ai";
    }
  })();

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.socialPreview.title}</p>
      <p className="mt-1 text-[11px] text-zinc-500">{sc.socialPreview.hint}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[9px] font-bold uppercase text-zinc-500">{sc.socialPreview.linkedin}</p>
          <p className="mt-2 line-clamp-2 text-sm font-bold text-white">{title || sc.socialPreview.fallbackTitle}</p>
          <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{description || sc.socialPreview.fallbackDesc}</p>
          <p className="mt-2 text-[10px] text-zinc-600">{host}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[9px] font-bold uppercase text-zinc-500">{sc.socialPreview.xCard}</p>
          <p className="mt-2 line-clamp-3 text-sm text-white">{description || title || sc.socialPreview.fallbackDesc}</p>
          <p className="mt-2 truncate text-[10px] text-sky-400/80">{url || "https://…"}</p>
        </div>
      </div>
    </div>
  );
}
