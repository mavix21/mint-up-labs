"use client";

import { Match } from "effect";
import { MapPin } from "lucide-react";

import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardLocationProps {
  className?: string;
}

export function EventCardLocation({ className }: EventCardLocationProps) {
  const { event } = useEventCardContext();

  return Match.value(event.location).pipe(
    Match.when({ type: "in-person" }, (location) => (
      <div
        className={cn(
          "text-muted-foreground flex items-center gap-1.5 text-sm",
          className,
        )}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="line-clamp-1">{location.address}</span>
      </div>
    )),
    Match.orElse(() => <p>TBD</p>),
  );
}
