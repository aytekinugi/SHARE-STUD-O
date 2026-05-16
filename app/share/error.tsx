"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ShareError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-24 text-center text-white">
      <p className="text-sm font-black uppercase tracking-[0.35em] text-gold">Paylaşım merkezi</p>
      <h1 className="text-3xl font-black">Burada küçük bir hata yakaladık</h1>
      <p className="max-w-lg text-sm text-zinc-400">{error.message || "Öngörülemeyen istemci hatası."}</p>
      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <Button type="button" className="rounded-2xl font-black" onClick={() => reset()}>
          Tekrar dene
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "secondary", size: "default" }), "rounded-2xl no-underline")}>
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
