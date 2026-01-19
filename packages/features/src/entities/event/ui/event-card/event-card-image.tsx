"use client";

import type { ReactNode } from "react";

import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardImageProps {
  className?: string;
  aspectRatio?: "video" | "square" | "portrait";
  children?: ReactNode; // For overlays (badges, buttons)
}

export function EventCardImage({
  className,
  aspectRatio = "video",
  children,
}: EventCardImageProps) {
  const { event } = useEventCardContext();

  const aspectStyles = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[4/3]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectStyles[aspectRatio],
        className,
      )}
    >
      <img
        src={event.image || "/placeholder.svg"}
        alt={event.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {children}
    </div>
  );
}
