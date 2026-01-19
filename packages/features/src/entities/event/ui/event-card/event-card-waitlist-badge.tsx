"use client";

import { Badge } from "@mint-up/ui/components/badge";
import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardWaitlistBadgeProps {
  className?: string;
  threshold?: number; // Percentage threshold to show badge
}

export function EventCardWaitlistBadge({
  className,
  threshold = 0.9,
}: EventCardWaitlistBadgeProps) {
  const { event } = useEventCardContext();

  // const soldPercentage = event.soldTickets && event.totalTickets ? event.soldTickets / event.totalTickets : 0
  const soldPercentage = 1; // Placeholder until data model is updated

  if (soldPercentage < threshold) return null;

  return (
    <Badge
      variant="outline"
      className={cn("border-primary/50 text-primary text-xs", className)}
    >
      Waitlist
    </Badge>
  );
}
