"use client";
import { motion } from "framer-motion";
import { Brain, Dumbbell, Flame, HeartHandshake } from "lucide-react";
import { progressPct } from "@/lib/gamification";

export function HeroPreview() {
  const xp = 1240;
  return (
    <motion.div initial={{ opacity: 0, y: 24, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: .8, ease: "easeOut" }} className="relative">
      <div className="absolute -inset-8 rounded-full bg-gold/10 blur-3xl" />
      <div className="glass relative overflow-hidden rounded-[2.25rem] p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">Level 3 Vanguard</p>
            <h3 className="mt-1 text-2xl font-black text-white">Digital Avatar</h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-orange-300"><Flame className="h-4 w-4" /> 9</div>
        </div>
        <div className="my-7 grid place-items-center">
          <motion.div animate={{ y: [0, -8, 0], filter: ["drop-shadow(0 0 20px rgba(212,175,55,.18))", "drop-shadow(0 0 42px rgba(212,175,55,.34))", "drop-shadow(0 0 20px rgba(212,175,55,.18))"] }} transition={{ repeat: Infinity, duration: 3 }} className="relative h-56 w-56 rounded-full border border-gold/30 bg-gradient-to-b from-gold/20 to-emerald/10">
            <div className="absolute inset-6 rounded-full border border-white/10 bg-black/50" />
            <div className="absolute left-1/2 top-12 h-20 w-20 -translate-x-1/2 rounded-full bg-gold/80" />
            <div className="absolute bottom-10 left-1/2 h-24 w-32 -translate-x-1/2 rounded-t-full bg-emerald/70" />
          </motion.div>
        </div>
        <div className="mb-5">
          <div className="mb-2 flex justify-between text-sm"><span className="text-zinc-400">XP Progress</span><span className="text-gold">{progressPct(xp)}%</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${progressPct(xp)}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-gold to-emerald" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{ icon: Dumbbell, label: 'STR', value: 41 }, { icon: Brain, label: 'INT', value: 72 }, { icon: HeartHandshake, label: 'CHA', value: 28 }].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[.03] p-3 text-center"><Icon className="mx-auto mb-2 h-5 w-5 text-gold" /><p className="text-xs text-zinc-500">{label}</p><p className="font-black text-white">{value}</p></div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
