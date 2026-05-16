"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const questions = [
  { key: "goals", label: "Hedeflerin neler?", hint: "Örn: kodlama öğrenmek, fit olmak, yeni bir iş kurmak..." },
  { key: "focus", label: "En çok ne zaman odaklanamıyorsun?", hint: "Örn: öğleden sonra, telefona bakınca, belirsiz görevlerde..." },
  { key: "hobbies", label: "Hobilerin ve enerjini artıran şeyler neler?", hint: "Örn: oyunlar, yürüyüş, müzik, kitaplar, kahve ritüeli..." }
] as const;

export function CharacterOnboarding({ username }: { username: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({ goals: "", focus: "", hobbies: "" });
  const [result, setResult] = useState<{
    characterClass: string;
    summary: string;
    quests?: unknown;
    cached?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const q = questions[step];

  async function finish() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers)
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Onboarding failed", {
          description: json.partial ? "Some data may not have saved." : undefined
        });
      } else {
        if (json.cached) {
          toast.success("Kampanyan zaten hazır", { description: "Mevcut karakter profilin yüklendi." });
        }
        setResult(json);
      }
    } catch {
      toast.error("Network error");
    }
    setLoading(false);
  }

  if (result)
    return (
      <main className="grid min-h-screen place-items-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass max-w-xl rounded-[2.5rem] p-8 text-center shadow-gold"
        >
          <Crown className="mx-auto mb-4 h-14 w-14 text-gold" />
          <p className="uppercase tracking-[0.3em] text-gold">Character forged</p>
          <h1 className="mt-3 text-4xl font-black text-white">{result.characterClass}</h1>
          <p className="mt-4 text-zinc-300">{result.summary}</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-7" size="lg">
            <Sparkles className="mr-2 h-5 w-5" /> Enter Command Center
          </Button>
        </motion.div>
      </main>
    );

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <section className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <Brain className="mx-auto mb-4 h-11 w-11 text-gold" />
          <p className="uppercase tracking-[0.3em] text-gold">The Ultimate Onboarding</p>
          <h1 className="mt-3 text-4xl font-black text-white">Welcome, {username}.</h1>
          <p className="mt-2 text-zinc-400">
            The Oracle will ask 3 strategic questions and forge your starter quest pack.
          </p>
        </div>
        <div className="glass rounded-[2.5rem] p-6 sm:p-8">
          <div className="mb-6 flex gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${i <= step ? "bg-gold" : "bg-white/10"}`}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={q.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="mb-4 text-2xl font-black text-white">{q.label}</h2>
              <Textarea
                value={answers[q.key]}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
                placeholder={q.hint}
                className="min-h-40"
                autoFocus
              />
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={step === 0 || loading} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            {step < questions.length - 1 ? (
              <Button disabled={!answers[q.key].trim()} onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={loading || !answers[q.key].trim()} onClick={finish}>
                {loading ? "Forging..." : "Forge my character"}
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
