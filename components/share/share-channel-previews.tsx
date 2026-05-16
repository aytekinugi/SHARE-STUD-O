"use client";

import type { ChannelSnippet } from "@/lib/share-channel-snippets";
import type { ShareMessages } from "@/lib/share-trust-copy";

type Props = {
  sc: ShareMessages;
  snippets: ChannelSnippet[];
};

export function ShareChannelPreviews({ sc, snippets }: Props) {
  if (snippets.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.channelSnippets.title}</p>
      <p className="mt-1 text-[11px] text-zinc-500">{sc.channelSnippets.hint}</p>
      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
        {snippets.map((s) => (
          <li key={s.id} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] font-bold text-zinc-400">
              {s.label}
              {s.maxChars ? ` · ~${s.maxChars}` : ""}
              {s.truncated ? ` · ${sc.channelSnippets.truncated}` : ""}
            </p>
            <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-[11px] text-zinc-300">{s.text}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
