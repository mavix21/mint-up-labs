"use client";

import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardDateBadgeProps {
  className?: string;
}

export function EventCardDateBadge({ className }: EventCardDateBadgeProps) {
  const { event } = useEventCardContext();

  const date = new Date(event.startDate);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();

  return (
    <div
      className={cn(
        "border-border/50 bg-background/95 flex flex-col items-center rounded-xl border px-3 py-2 text-center backdrop-blur-sm",
        className,
      )}
    >
      <span className="text-muted-foreground text-[10px] font-semibold tracking-wider">
        {month}
      </span>
      <span className="text-2xl leading-none font-bold">{day}</span>
    </div>
  );
}
