"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Crown } from "lucide-react";

export function LevelUpBurst({ show, level }: { show: boolean; level: number }) {
  return <AnimatePresence>{show && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-black/35 backdrop-blur-[2px]"><motion.div initial={{ scale: .4, rotate: -8 }} animate={{ scale: [0.4, 1.12, 1], rotate: 0 }} exit={{ scale: .8, opacity: 0 }} transition={{ duration: .75, ease: "easeOut" }} className="relative text-center"><div className="absolute -inset-20 rounded-full bg-gold/30 blur-3xl"/><Crown className="relative mx-auto mb-4 h-20 w-20 text-gold drop-shadow-[0_0_30px_rgba(212,175,55,.8)]"/><p className="relative uppercase tracking-[.45em] text-gold">Level Up</p><h2 className="relative text-6xl font-black text-white">Level {level}</h2></motion.div></motion.div>}</AnimatePresence>;
}
