import React from "react";
import { VaccineCard } from "@/components/vaccination/VaccineCard";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import type { VaccineRecommendation } from "@shared/api";

interface ScheduleSectionProps {
  title: string;
  vaccines: VaccineRecommendation[];
  onRemind: (vaccine: VaccineRecommendation) => void;
  contextLabel?: string;
  emptyMessage?: string;
  isSavingReminder?: boolean;
  layout?: "grid" | "carousel";
}

const emptyStateClass =
  "rounded-3xl border border-dashed border-white/45 bg-gradient-to-br from-white/65 via-white/35 to-white/15 backdrop-blur-xl shadow-[0_20px_56px_rgba(79,70,229,0.12)]";

export function ScheduleSection({
  title,
  vaccines,
  onRemind,
  contextLabel,
  emptyMessage = "No vaccines in this section for now.",
  isSavingReminder = false,
  layout = "grid",
}: ScheduleSectionProps) {
  const subtitleBase = title.toLowerCase().includes("upcoming")
    ? "Stay ahead with the next protection milestones"
    : "Review vaccinations recommended within the last two years";
  const subtitle = contextLabel
    ? `${subtitleBase} for ${contextLabel}`
    : subtitleBase;

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600">
            {title}
          </p>
          <h3 className="dashboard-title text-lg md:text-xl font-semibold tracking-tight leading-snug text-slate-900">
            {subtitle}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {vaccines.length} item{vaccines.length === 1 ? "" : "s"}
        </span>
      </header>
      {vaccines.length === 0 ? (
        <div
          className={cn(
            emptyStateClass,
            "p-8 text-center text-sm text-muted-foreground",
          )}
        >
          {emptyMessage}
        </div>
      ) : layout === "carousel" ? (
        <div className="relative">
          <Carousel opts={{ align: "start", slidesToScroll: 1 }}>
            <CarouselContent>
              {vaccines.map((vaccine) => (
                <CarouselItem
                  key={vaccine.id}
                  className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="pr-2">
                    <VaccineCard
                      vaccine={vaccine}
                      onRemind={onRemind}
                      contextLabel={contextLabel}
                      isSavingReminder={isSavingReminder}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 shadow-md bg-white/80 backdrop-blur" />
            <CarouselNext className="-right-4 shadow-md bg-white/80 backdrop-blur" />
          </Carousel>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {vaccines.map((vaccine) => (
            <VaccineCard
              key={vaccine.id}
              vaccine={vaccine}
              onRemind={onRemind}
              contextLabel={contextLabel}
              isSavingReminder={isSavingReminder}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}
