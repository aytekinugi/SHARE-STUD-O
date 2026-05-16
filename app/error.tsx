"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="glass max-w-md rounded-[2rem] p-7 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-gold" />
        <h1 className="text-3xl font-black text-white">The realm flickered.</h1>
        <p className="mt-3 text-zinc-400">A recoverable error occurred. Your progress is safe; try reloading the current mission.</p>
        <Button onClick={reset} className="mt-6">Restore session</Button>
      </div>
    </main>
  );
}
