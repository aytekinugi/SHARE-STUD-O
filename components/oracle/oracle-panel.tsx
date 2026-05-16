"use client";

import { useState } from "react";
import { BrainCircuit, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function OraclePanel({ initialInsight }: { initialInsight?: string }) {
  const [report, setReport] = useState(initialInsight ?? "The Oracle is ready to analyze your last 7 days.");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/oracle/daily-report", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Oracle request failed");
        setReport(initialInsight ?? "The Oracle hit a snag. Retry in a moment.");
      } else {
        setReport(json.content ?? "");
        toast.success("Battle report forged");
      }
    } catch {
      toast.error("Network error");
    }
    setLoading(false);
  }

  return (
    <Card className="rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gold">AI Oracle</p>
          <h2 className="text-2xl font-black text-white">Predictive Brief</h2>
        </div>
        <BrainCircuit className="h-6 w-6 text-gold" />
      </div>
      <div className="mb-4 whitespace-pre-wrap rounded-2xl border border-gold/15 bg-gold/10 p-4 text-sm leading-6 text-zinc-200">
        {report}
      </div>
      <Button onClick={generate} disabled={loading} variant="secondary" className="w-full">
        <FileText className="mr-2 h-4 w-4" />
        {loading ? "Analyzing..." : "Generate Battle Report"}
      </Button>
    </Card>
  );
}
