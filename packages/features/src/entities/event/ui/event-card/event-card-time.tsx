"use client";

import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardTimeProps {
  className?: string;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = Number.parseInt(hours ?? "0", 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export function EventCardTime({ className }: EventCardTimeProps) {
  const { event } = useEventCardContext();

  return (
    <span className={cn("text-muted-foreground text-sm", className)}>
      7:00 PM
    </span>
  );
}
