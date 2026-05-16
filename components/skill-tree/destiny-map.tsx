"use client";
import { motion } from "framer-motion";
import { GitBranch, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { unlockedSkillCount } from "@/lib/gamification";
import type { Quest } from "@/lib/types";

const nodes = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, x: (i % 4) * 30 + 5, y: Math.floor(i / 4) * 32 + 8 }));

export function DestinyMap({ quests }: { quests: Quest[] }) {
  const unlocked = unlockedSkillCount(quests.filter(q => q.status === "done").length);
  return <Card className="rounded-[2rem] p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm uppercase tracking-[.25em] text-gold">Destiny Map</p><h2 className="text-2xl font-black text-white">Skill Tree</h2></div><GitBranch className="h-6 w-6 text-gold"/></div><div className="relative h-72 overflow-hidden rounded-3xl border border-white/10 bg-black/30"><svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">{nodes.slice(1).map((n,i)=><line key={n.id} x1={nodes[i].x+4} y1={nodes[i].y+4} x2={n.x+4} y2={n.y+4} stroke={i < unlocked-1 ? '#D4AF37' : 'rgba(255,255,255,.12)'} strokeWidth=".8" />)}</svg>{nodes.map(n => { const active = n.id <= unlocked; return <motion.div key={n.id} initial={false} animate={{ scale: active ? 1 : .85, boxShadow: active ? '0 0 32px rgba(212,175,55,.45)' : 'none' }} className={`absolute grid h-10 w-10 place-items-center rounded-full border ${active?'border-gold bg-gold/20 text-gold':'border-white/10 bg-white/5 text-zinc-600'}`} style={{ left:`${n.x}%`, top:`${n.y}%` }}><Sparkles className="h-4 w-4"/></motion.div> })}</div></Card>;
}
