"use client";

import { useState } from "react";
import { Gem, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MarketplaceItem, Profile } from "@/lib/types";

const fallback: MarketplaceItem[] = [
  {
    id: "boost",
    name: "Emerald Focus Boost",
    description: "2 hours of +20% XP.",
    item_type: "boost",
    price_gold: 45,
    rarity: "rare",
    effect_json: { duration_hours: 2 }
  },
  {
    id: "skin",
    name: "Obsidian Mantle",
    description: "Legendary avatar skin.",
    item_type: "skin",
    price_gold: 120,
    rarity: "legendary",
    effect_json: null
  }
];

export function MarketplacePanel({
  profile,
  setProfile
}: {
  profile: Profile;
  setProfile: (p: Profile) => void;
}) {
  const [items] = useState(fallback);
  const [loading, setLoading] = useState<string | null>(null);

  async function buy(item: MarketplaceItem) {
    setLoading(item.id);
    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          fallbackType: item.item_type,
          price: item.price_gold
        })
      });
      const json = await res.json();
      if (!res.ok) toast.error(json.error ?? "Purchase failed");
      else {
        toast.success(`Acquired ${item.name}`);
        setProfile({
          ...profile,
          gold: json.gold,
          focus_boost_until: json.focus_boost_until ?? profile.focus_boost_until
        });
      }
    } catch {
      toast.error("Network error");
    }
    setLoading(null);
  }

  return (
    <Card className="rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Marketplace</p>
          <h2 className="text-2xl font-black text-white">Gold Vault</h2>
        </div>
        <div className="rounded-full bg-gold/10 px-3 py-1 text-gold">
          <Gem className="mr-1 inline h-4 w-4" />
          {profile.gold}
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.item_type === "boost" ? Zap : ShoppingBag;
          return (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-black text-white">{item.name}</p>
                  <p className="text-sm text-zinc-400">{item.description}</p>
                </div>
                <div className="text-gold">{item.price_gold}G</div>
              </div>
              <Button
                type="button"
                onClick={() => buy(item)}
                disabled={loading === item.id || profile.gold < item.price_gold}
                className="mt-3 w-full"
                variant="secondary"
              >
                <Icon className="mr-2 h-4 w-4" /> Buy
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
