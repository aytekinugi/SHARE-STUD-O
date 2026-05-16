"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import type { ShareMessages } from "@/lib/share-trust-copy";

type Props = {
  sc: ShareMessages;
  text: string;
  setText: (v: string) => void;
  textB: string;
  setTextB: (v: string) => void;
  activeVariant: "a" | "b";
  setActiveVariant: (v: "a" | "b") => void;
};

export function ShareAbPanel({ sc, text, setText, textB, setTextB, activeVariant, setActiveVariant }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-gold">{sc.ab.title}</p>
      <p className="mt-1 text-[11px] text-zinc-500">{sc.ab.hint}</p>
      <div className="mt-3 flex gap-2">
        {(["a", "b"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setActiveVariant(v)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold uppercase",
              activeVariant === v ? "bg-gold/25 text-gold" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {v === "a" ? sc.ab.variantA : sc.ab.variantB}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3">
        <div className={cn(activeVariant !== "a" && "opacity-60")}>
          <label className="mb-1 block text-[10px] text-zinc-500">{sc.ab.variantA}</label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-20 rounded-xl text-sm" />
        </div>
        <div className={cn(activeVariant !== "b" && "opacity-60")}>
          <label className="mb-1 block text-[10px] text-zinc-500">{sc.ab.variantB}</label>
          <Textarea value={textB} onChange={(e) => setTextB(e.target.value)} className="min-h-20 rounded-xl text-sm" />
        </div>
      </div>
    </div>
  );
}
