"use client";

import { useState } from "react";
import { Chrome, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      toast.error("Supabase is not configured.", {
        description: "Copy .env.example to .env.local and add URL + anon key."
      });
      return;
    }
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
    setLoading(false);
  }

  async function signInWithEmail() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      toast.error("Supabase is not configured.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    });
    if (error) toast.error(error.message);
    else toast.success("Magic link sent", { description: "Check your inbox to continue." });
    setLoading(false);
  }

  return (
    <Card className="p-1">
      <div className="rounded-[1.35rem] p-5">
        <Button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full"
          size="lg"
          type="button"
        >
          <Chrome className="mr-2 h-5 w-5" /> Continue with Google
        </Button>
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-zinc-600">
          <span className="h-px flex-1 bg-white/10" /> or{" "}
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="space-y-3">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hero@domain.com"
            type="email"
            autoComplete="email"
          />
          <Button
            onClick={signInWithEmail}
            disabled={loading || !email}
            variant="secondary"
            className="w-full"
            size="lg"
            type="button"
          >
            <Mail className="mr-2 h-5 w-5" /> Email magic link
          </Button>
        </div>
      </div>
    </Card>
  );
}
