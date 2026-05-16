"use client";

import type { ShareMessages } from "@/lib/share-trust-copy";

export function ShareSafariNote({ sc }: { sc: ShareMessages }) {
  return (
    <details className="mx-auto mb-8 max-w-2xl rounded-2xl border border-sky-500/25 bg-sky-500/[0.06] p-4 text-left open:border-sky-400/35">
      <summary className="cursor-pointer select-none text-sm font-bold text-sky-200/95">{sc.safari.summary}</summary>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400">{sc.safari.body}</p>
    </details>
  );
}
