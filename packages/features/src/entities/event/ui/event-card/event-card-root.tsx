import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@mint-up/ui/lib/utils";

import type { Event } from "../../model";
import { EventCardContext } from "./event-card-context";

interface EventCardRootProps {
  event: Event;
  children: ReactNode;
  className?: string;
  variant?: "featured" | "list";
  asLink?: boolean;
}

export function EventCardRoot({
  event,
  children,
  className,
  variant = "list",
  asLink = true,
}: EventCardRootProps) {
  const baseStyles =
    variant === "featured"
      ? "group relative block w-72 shrink-0 overflow-hidden rounded-2xl bg-card"
      : "group flex gap-4 rounded-xl bg-card p-4 transition-colors hover:bg-card/80";

  const content = (
    <EventCardContext.Provider value={{ event }}>
      {children}
    </EventCardContext.Provider>
  );

  if (asLink) {
    return (
      <Link href={`/event/${event._id}`} className={cn(baseStyles, className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn(baseStyles, className)}>{content}</div>;
}
