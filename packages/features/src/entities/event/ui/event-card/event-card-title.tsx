"use client";

import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardTitleProps {
  className?: string;
  lineClamp?: 1 | 2 | 3;
}

export function EventCardTitle({
  className,
  lineClamp = 1,
}: EventCardTitleProps) {
  const { event } = useEventCardContext();

  const clampStyles = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
  };

  return (
    <h3
      className={cn(
        "leading-tight font-semibold",
        clampStyles[lineClamp],
        className,
      )}
    >
      {event.name}
    </h3>
  );
}
