import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const tiers = [
    { name: "Free", price: "$0", cta: "Start free", href: "/login", features: ["Basic quest tracking", "3 AI suggestions/day", "Core avatar progression"] },
    { name: "Legendary", price: "$12", cta: "Unlock Legendary", href: "/dashboard", featured: true, features: ["Unlimited Oracle coaching", "Legendary skins", "Focus boosts", "Guild leaderboard", "Daily battle reports"] }
  ];
  return <main className="min-h-screen px-5 py-10"><section className="mx-auto max-w-5xl"><div className="mb-10 text-center"><Crown className="mx-auto mb-4 h-10 w-10 text-gold"/><p className="uppercase tracking-[.3em] text-gold">The Vault</p><h1 className="mt-3 text-5xl font-black text-white">Pricing for heroes.</h1></div><div className="grid gap-5 md:grid-cols-2">{tiers.map(t => <div key={t.name} className={`glass rounded-[2rem] p-7 ${t.featured ? 'shadow-gold ring-1 ring-gold/30' : ''}`}><h2 className="text-2xl font-black text-white">{t.name}</h2><div className="my-5"><span className="text-5xl font-black text-gold">{t.price}</span><span className="text-zinc-500">/mo</span></div><ul className="mb-7 space-y-3">{t.features.map(f => <li key={f} className="flex gap-3 text-zinc-200"><Check className="h-5 w-5 text-emerald"/> {f}</li>)}</ul><Link href={t.href}><Button className="w-full" variant={t.featured ? 'default' : 'secondary'} size="lg">{t.cta}</Button></Link></div>)}</div></section></main>;
}
