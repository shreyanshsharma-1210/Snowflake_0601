import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const glassClass =
  "rounded-3xl border border-white/45 bg-gradient-to-br from-white/85 via-white/50 to-white/25 backdrop-blur-xl shadow-[0_24px_64px_rgba(59,130,246,0.16)]";

const FACTS: string[] = [
  "Vaccines prevent 4–5 million deaths each year worldwide.",
  "The WHO lists vaccine hesitancy as a top global health threat.",
  "Herd immunity protects people who can’t be vaccinated.",
  "The first vaccine was for smallpox, developed in 1796.",
  "Vaccines are rigorously tested for safety and effectiveness.",
  "Most vaccine side effects are mild and temporary (like a sore arm).",
  "Keeping your vaccine card helps track booster schedules.",
  "HPV vaccination can prevent most cervical cancers.",
  "Flu viruses change; that’s why annual flu shots are recommended.",
  "Combination vaccines reduce the number of shots needed.",
];

function getRandomIndex(exclude: number | null, max: number) {
  if (max <= 1) return 0;
  let idx = Math.floor(Math.random() * max);
  if (exclude !== null && idx === exclude) {
    idx = (idx + 1) % max;
  }
  return idx;
}

export function VaccineFacts({ className }: { className?: string }) {
  const [index, setIndex] = useState<number>(() =>
    getRandomIndex(null, FACTS.length),
  );

  // Auto-rotate every 10s (pause-friendly: simple implementation)
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => getRandomIndex(prev, FACTS.length));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const fact = useMemo(() => FACTS[index], [index]);

  return (
    <Card
      className={cn(glassClass, "p-4") + (className ? ` ${className}` : "")}
    >
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-base leading-tight">Vaccine Fact</CardTitle>
      </CardHeader>
      <CardContent className="p-0 text-xs text-muted-foreground">
        <p className="leading-relaxed">{fact}</p>
      </CardContent>
    </Card>
  );
}
