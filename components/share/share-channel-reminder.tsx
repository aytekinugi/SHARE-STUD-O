"use client";

import type { ShareMessages } from "@/lib/share-trust-copy";

type Props = {
  sc: ShareMessages;
  labels: string[];
};

export function ShareChannelReminder({ sc, labels }: Props) {
  if (labels.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-50">
      <p className="font-bold text-amber-100">{sc.channelReminder.title}</p>
      <p className="mt-1 text-amber-100/90">{sc.channelReminder.body}</p>
      <ul className="mt-2 list-inside list-disc text-amber-100/80">
        {labels.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
