"use client";

import { useEffect, useState } from "react";
import { Crown, MessageCircle, Send, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Guild, GuildMember, GuildMessage } from "@/lib/types";

export function GuildPanel() {
  const [guild, setGuild] = useState<Guild | null>(null);
  const [leaderboard, setLeaderboard] = useState<GuildMember[]>([]);
  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("Vanguard Guild");

  async function load() {
    const res = await fetch("/api/guilds");
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Could not load guild");
      return;
    }
    setGuild(json.guild ?? null);
    setLeaderboard(json.leaderboard ?? []);
    setMessages(json.messages ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createGuild() {
    const res = await fetch("/api/guilds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const json = await res.json();
    if (!res.ok) toast.error(json.error ?? "Guild failed");
    else {
      toast.success(`Guild "${json.guild?.name ?? name}" forged`);
      load();
    }
  }

  async function send() {
    if (!text.trim() || !guild) return;
    const res = await fetch("/api/guilds/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId: guild.id, content: text })
    });
    const json = await res.json();
    if (!res.ok) toast.error(json.error ?? "Message failed");
    else setText("");
    load();
  }

  if (!guild)
    return (
      <Card className="rounded-[2rem] p-5">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Guilds</p>
          <h2 className="text-2xl font-black text-white">Create your first guild</h2>
          <p className="mt-2 text-sm text-zinc-400">Unite with heroes who share your goals.</p>
        </div>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Guild name" />
          <Button type="button" onClick={createGuild}>
            Create
          </Button>
        </div>
      </Card>
    );

  return (
    <Card className="rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Guild</p>
          <h2 className="text-2xl font-black text-white">{guild.name}</h2>
        </div>
        <Shield className="h-6 w-6 text-gold" />
      </div>
      <div className="mb-4 rounded-2xl border border-white/10 bg-black/30 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Weekly XP Leaderboard</p>
        {leaderboard.map((m, i) => (
          <div key={m.user_id} className="flex justify-between py-1 text-sm">
            <span className="text-zinc-200">
              {i === 0 && <Crown className="mr-1 inline h-4 w-4 text-gold" />}
              {m.profiles?.username ?? "Hero"}
            </span>
            <span className="text-gold">{m.weekly_xp} XP</span>
          </div>
        ))}
      </div>
      <div className="mb-3 max-h-44 space-y-2 overflow-auto">
        {messages.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white/[.04] p-3 text-sm">
            <p className="mb-1 text-xs text-gold">
              <MessageCircle className="mr-1 inline h-3 w-3" />
              {m.profiles?.username ?? "Hero"}
            </p>
            <p className="text-zinc-200">{m.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send guild message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <Button type="button" onClick={send} size="icon" aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
