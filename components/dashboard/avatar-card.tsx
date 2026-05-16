"use client";
import { motion } from "framer-motion";
import { Brain, Dumbbell, Flame, Heart, HeartHandshake, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { levelFromXp, progressPct, streakFlame, XP_PER_LEVEL } from "@/lib/gamification";
import type { Profile } from "@/lib/types";

export function AvatarCard({ profile, stats, streak }: { profile: Profile; stats: {str:number;int:number;cha:number}; streak: number }) {
  const flame = streakFlame(streak);
  return (
    <Card className="relative overflow-hidden rounded-[2rem] p-6">
      <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.28em] text-gold">Level {levelFromXp(profile.xp)}</p><h2 className="mt-1 text-3xl font-black text-white">{profile.username ?? 'Vanguard'}</h2><p className="mt-1 text-sm text-zinc-500">{profile.bio ?? 'Forge discipline. Claim the day.'}</p></div><div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-red-200"><Heart className="mr-1 inline h-4 w-4" /> {profile.health_points} HP</div></div>
      <div className="relative my-7 grid place-items-center"><motion.div animate={{ y: [0,-7,0], rotate: [0,1.5,0] }} transition={{ repeat: Infinity, duration: 3.2 }} className="grid h-60 w-60 place-items-center rounded-full border border-gold/25 bg-gradient-to-b from-gold/20 via-white/[.03] to-emerald/10 shadow-gold"><Shield className="h-28 w-28 text-gold" /></motion.div><motion.div animate={{ scale: [1,1.08,1], opacity: [.7,1,.7] }} transition={{ repeat: Infinity, duration: 1.6 }} className="absolute bottom-4 flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/15 px-4 py-2 text-orange-200"><Flame className="h-5 w-5" /> {streak} day {flame}</motion.div></div>
      <div className="mb-5"><div className="mb-2 flex justify-between text-sm"><span className="text-zinc-400">XP to next rank</span><span className="text-gold">{profile.xp % XP_PER_LEVEL}/{XP_PER_LEVEL}</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${progressPct(profile.xp)}%` }} className="h-full bg-gradient-to-r from-gold to-emerald" /></div></div>
      <div className="grid grid-cols-3 gap-3">{[{icon:Dumbbell,label:'STR',value:stats.str},{icon:Brain,label:'INT',value:stats.int},{icon:HeartHandshake,label:'CHA',value:stats.cha}].map(({icon:Icon,label,value}) => <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center"><Icon className="mx-auto mb-2 h-5 w-5 text-gold"/><p className="text-xs text-zinc-500">{label}</p><p className="font-black text-white">{value}</p></div>)}</div>
    </Card>
  );
}
