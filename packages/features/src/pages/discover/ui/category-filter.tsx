"use client";

import type { LucideIcon } from "lucide-react";
import { SparklesIcon } from "lucide-react";
import { useLocale } from "next-intl";

import { cn } from "@mint-up/ui/lib/utils";

import type { EventCategory } from "../../../entities/event/model";
import { EVENT_CATEGORIES_MAP } from "../../../entities/event/model";

const typedEntries = <T extends Record<string, unknown>>(obj: T) =>
  Object.entries(obj) as { [K in keyof T]: [K, T[K]] }[keyof T][];

const categoryFilters: {
  id: EventCategory | "all";
  label: string;
  labels?: { en: string; es: string };
  icon: LucideIcon;
}[] = [
  {
    id: "all",
    label: "All",
    labels: { en: "All", es: "Todos" },
    icon: SparklesIcon,
  },
  ...typedEntries(EVENT_CATEGORIES_MAP).map(
    ([id, { label, localizedLabels: labels, icon }]) => ({
      id,
      label,
      labels,
      icon,
    }),
  ),
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: EventCategory | "all") => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const locale = useLocale();

  return (
    <div className="hide-scrollbar -mx-4 overflow-x-auto px-4">
      <div className="flex gap-2 pb-2">
        {categoryFilters.map((category) => {
          const isSelected = selected === category.id;
          const localizedLabel =
            category.labels?.[locale as "en" | "es"] ?? category.label;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              <category.icon className="size-4" />
              {localizedLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
