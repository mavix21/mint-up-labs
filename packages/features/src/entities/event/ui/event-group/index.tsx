"use client";

import * as React from "react";

import { cn } from "@mint-up/ui/lib/utils";

import type { Event } from "../../model";

// Context for sharing grouped events data
interface EventGroupContextValue {
  groupedEvents: Map<string, Event[]>;
}

const EventGroupContext = React.createContext<EventGroupContextValue | null>(
  null,
);

function _useEventGroupContext() {
  const context = React.useContext(EventGroupContext);
  if (!context) {
    throw new Error(
      "EventGroup components must be used within EventGroup.Root",
    );
  }
  return context;
}

// Helper to group events by date
function groupEventsByDate(events: Event[]): Map<string, Event[]> {
  const grouped = new Map<string, Event[]>();

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  sortedEvents.forEach((event) => {
    const dateKey = event.startDate.toString();
    const existing = grouped.get(dateKey) ?? [];
    grouped.set(dateKey, [...existing, event]);
  });

  return grouped;
}

// Root component - provides context and groups events
interface RootProps {
  events: Event[];
  children: (groupedEvents: Map<string, Event[]>) => React.ReactNode;
}

function Root({ events, children }: RootProps) {
  const groupedEvents = React.useMemo(
    () => groupEventsByDate(events),
    [events],
  );

  return (
    <EventGroupContext.Provider value={{ groupedEvents }}>
      {children(groupedEvents)}
    </EventGroupContext.Provider>
  );
}

// DateHeader component - displays the date as section header
interface DateHeaderProps {
  date: string;
  className?: string;
}

function DateHeader({ date, className }: DateHeaderProps) {
  const [isStuck, setIsStuck] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not visible (above viewport), header is stuck
        if (entry) {
          setIsStuck(!entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const dateObj = new Date(date);

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const dayOfWeek = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
  });

  return (
    <>
      {/* Sentinel element to detect sticky state */}
      <div
        ref={sentinelRef}
        className="pointer-events-none h-0 w-0"
        aria-hidden="true"
      />

      <div
        className={cn(
          "sticky top-4 z-50 flex w-fit items-center gap-2 transition-all duration-200",
          isStuck
            ? "border-border/50 bg-background/80 rounded-full border px-4 py-2 backdrop-blur-md"
            : "bg-transparent py-2",
          className,
        )}
      >
        {/* Timeline dot */}
        <div className="bg-primary h-2 w-2 rounded-full" />

        {/* Date text */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{formattedDate}</span>
          <span className="text-muted-foreground text-sm">{dayOfWeek}</span>
        </div>
      </div>
    </>
  );
}

// List component - wraps the event cards for a single date
interface ListProps {
  children: React.ReactNode;
  className?: string;
}

function List({ children, className }: ListProps) {
  return (
    <div className={cn("border-border relative ml-1 border-l pl-5", className)}>
      {children}
    </div>
  );
}

// Empty state component
interface EmptyProps {
  message?: string;
}

function Empty({ message = "No events found" }: EmptyProps) {
  return (
    <p className="text-muted-foreground py-8 text-center text-sm">{message}</p>
  );
}

// Export compound component
export const EventGroup = {
  Root,
  DateHeader,
  List,
  Empty,
};
