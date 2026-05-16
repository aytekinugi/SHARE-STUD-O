"use client";

import { ShieldCheck } from "lucide-react";
import type { ShareMessages } from "@/lib/share-trust-copy";

export function ShareTrustBanner({ sc }: { sc: ShareMessages }) {
  return (
    <div
      role="status"
      className="mx-auto mt-6 max-w-2xl rounded-[1.75rem] border border-emerald-500/35 bg-emerald-500/[0.08] px-4 py-3.5 text-left text-[13px] leading-snug text-zinc-300 sm:text-sm"
    >
      <div className="flex gap-3 sm:gap-4">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
        <div>
          <p className="font-black text-white">{sc.trustBanner.title}</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-zinc-400">
            {sc.trustBanner.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
