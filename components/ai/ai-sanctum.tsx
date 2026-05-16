"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Lock, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Quest } from "@/lib/types";

type Message = { role: "sage" | "user"; content: string };

export function AiSanctum({ isPro, onQuestsCreated, onUpgrade }: { isPro: boolean; onQuestsCreated: (quests: Quest[]) => void; onUpgrade: () => void }) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "sage", content: "Tell me a vague ambition. I will forge it into a quest plan with XP, categories, and first actions." }]);

  async function askSage() {
    if (!goal.trim()) return;
    setLoading(true);
    setMessages(m => [...m, { role: "user", content: goal }]);
    const res = await fetch("/api/ai-coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal }) });
    const json = await res.json();
    if (!res.ok) {
      setMessages(m => [...m, { role: "sage", content: json.error ?? "The Sanctum is temporarily sealed." }]);
      if (json.upgradeRequired) onUpgrade();
    } else {
      setMessages(m => [...m, { role: "sage", content: json.summary }]);
      onQuestsCreated(json.quests);
      setGoal("");
    }
    setLoading(false);
  }

  return (
    <Card className="rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between"><div><p className="text-sm uppercase tracking-[0.25em] text-gold">AI Sanctum</p><h2 className="text-2xl font-black text-white">The Sage</h2></div>{!isPro && <button onClick={onUpgrade} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs text-gold"><Lock className="mr-1 inline h-3 w-3" /> 3/day</button>}</div>
      <div className="no-scrollbar mb-4 max-h-72 space-y-3 overflow-auto pr-1">
        {messages.map((m, i) => <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl p-4 ${m.role==='sage'?'border border-gold/15 bg-gold/10 text-zinc-100':'ml-8 bg-white/10 text-white'}`}><div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">{m.role==='sage'?<Brain className="h-3 w-3"/>:<Sparkles className="h-3 w-3"/>}{m.role}</div><p className="whitespace-pre-wrap text-sm leading-6">{m.content}</p></motion.div>)}
      </div>
      <div className="space-y-3"><Textarea value={goal} onChange={(e)=>setGoal(e.target.value)} placeholder="Example: I want to learn coding, get fit, and become more confident..." /><Button disabled={loading || !goal.trim()} onClick={askSage} className="w-full" size="lg"><Send className="mr-2 h-5 w-5" /> {loading ? "Forging quests..." : "Forge Quest Plan"}</Button></div>
    </Card>
  );
}
