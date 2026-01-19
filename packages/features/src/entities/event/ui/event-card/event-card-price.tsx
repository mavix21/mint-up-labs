"use client";

import { Badge } from "@mint-up/ui/components/badge";
import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardPriceProps {
  className?: string;
  variant?: "badge" | "text";
}

export function EventCardPrice({
  className,
  variant = "badge",
}: EventCardPriceProps) {
  const { event } = useEventCardContext();

  // const priceText = event.price === 0 ? "FREE" : `$${event.price} ${event.currency}`
  const priceText = "FREE"; // Placeholder until data model is updated

  if (variant === "text") {
    return (
      <span className={cn("text-primary text-sm font-medium", className)}>
        {priceText}
      </span>
    );
  }

  return (
    <Badge variant="secondary" className={cn("shrink-0", className)}>
      {priceText}
    </Badge>
  );
}
