"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShareMessages } from "@/lib/share-trust-copy";

type Props = {
  sc: ShareMessages;
  selectedCount: number;
  batchBusy: boolean;
  onBatch: () => void;
};

export function ShareStudioFooter({ sc, selectedCount, batchBusy, onBatch }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/80 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-busy={batchBusy}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-[11px] leading-relaxed text-zinc-500 sm:text-left">
          <span className="mr-2 font-bold text-white/90">{sc.stickyFooter.prefix}</span>
          {sc.stickyFooter.flow}{" "}
          <span className="font-bold text-gold">{sc.stickyFooter.flowN}</span> {sc.stickyFooter.flow2}{" "}
          <span className="text-zinc-400">{selectedCount}</span> {sc.stickyFooter.channels}{" "}
          <span className="inline-block rounded border border-white/10 px-1 font-mono text-[10px] text-zinc-400">B</span> {sc.stickyFooter.kbdB}
        </p>
        <Button type="button" size="lg" className="rounded-2xl font-black sm:min-w-[280px]" onClick={onBatch} disabled={batchBusy}>
          {batchBusy ? <Loader2 className="mr-2 h-5 w-5 shrink-0 animate-spin" aria-hidden /> : <Sparkles className="mr-2 h-5 w-5" />}
          {batchBusy ? sc.buttons.batchBusy : sc.buttons.batch}
        </Button>
      </div>
      {batchBusy ? <p className="sr-only">{sc.batchStatus.busy}</p> : null}
    </div>
  );
}
