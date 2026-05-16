"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function UpgradeModal({
  open,
  setOpen
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      toast.error(json.error ?? "Checkout unavailable");
    } catch {
      toast.error("Network error", { description: "Could not reach checkout." });
    }
    setLoading(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="glass w-full max-w-lg rounded-[2rem] p-6 shadow-gold"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-gold">The Vault</p>
                <h2 className="text-3xl font-black text-white">Unlock Pro</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 rounded-3xl border border-gold/20 bg-gold/10 p-5">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-gold">$12</span>
                <span className="pb-2 text-zinc-400">/ month</span>
              </div>
              <p className="mt-2 text-zinc-300">
                Built for high-agency users who want daily AI guidance.
              </p>
            </div>
            <div className="mb-6 space-y-3">
              {[
                "The Sage: unlimited AI coaching",
                "Legendary avatar skins",
                "AI-generated weekly life-audit reports",
                "Priority access to new progression mechanics"
              ].map((x) => (
                <div key={x} className="flex items-center gap-3 text-zinc-200">
                  <Sparkles className="h-4 w-4 text-gold" /> {x}
                </div>
              ))}
            </div>
            <Button onClick={checkout} disabled={loading} size="lg" className="w-full">
              <Crown className="mr-2 h-5 w-5" />{" "}
              {loading ? "Opening vault..." : "Upgrade to Pro"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
