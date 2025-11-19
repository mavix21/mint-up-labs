"use client";

import * as React from "react";
import { CalendarPlus, History } from "lucide-react";

import { api } from "@mint-up/convex/_generated/api";
import { useQuery } from "@mint-up/convex/react";
import { Skeleton } from "@mint-up/ui/components/skeleton";

import {
  formatRelativeDate,
  getDayOfWeek,
  groupByDate,
} from "@/app/_shared/lib/date/date-utils";

import type { EventTab } from "./events-container";
import { EventDateGroup } from "./event-date-group";

interface EventsListProps {
  tab: EventTab;
}

export function EventsList({ tab }: EventsListProps) {
  const allUserEvents = useQuery(api.events.getUserEvents);
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
  }, []);

  // Memoize filtered events to avoid recalculation on every render
  const { upcomingEvents, pastEvents } = React.useMemo(() => {
    if (!allUserEvents || now === null) {
      return { upcomingEvents: [], pastEvents: [] };
    }

    const upcoming = allUserEvents.filter((event) => {
      // Event is upcoming if it hasn't ended yet (endDate > now)
      // If no endDate, fall back to startDate > now
      return event.endDate ? event.endDate > now : event.startDate > now;
    });
    const past = allUserEvents.filter((event) => {
      // Event is past if it has ended (endDate <= now)
      // If no endDate, fall back to startDate <= now
      return event.endDate ? event.endDate <= now : event.startDate <= now;
    });

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [allUserEvents, now]);

  if (!allUserEvents || now === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const targetEvents = tab === "upcoming" ? upcomingEvents : pastEvents;
  const sortDirection = tab === "upcoming" ? "asc" : "desc";

  if (targetEvents.length === 0) {
    if (tab === "upcoming") {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="bg-muted/50 rounded-full p-4">
            <CalendarPlus className="text-muted-foreground h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Upcoming Events Yet!</h3>
            <p className="text-muted-foreground max-w-xs text-sm">
              It looks like you don&apos;t have any events planned. Create a new
              one or explore what&apos;s happening!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="bg-muted/50 rounded-full p-4">
          <History className="text-muted-foreground h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Past Events Found</h3>
          <p className="text-muted-foreground max-w-xs text-sm">
            Once you attend or create events, they&apos;ll appear here for your
            review.
          </p>
        </div>
      </div>
    );
  }

  const groupedEvents = groupByDate(
    targetEvents,
    (event) => {
      const date = new Date(event.startDate);
      return date.toLocaleDateString(); // Uses user's locale and timezone
    },
    sortDirection,
  ).map(([_, events]) => ({
    date: formatRelativeDate(events[0].startDate),
    dayOfWeek: getDayOfWeek(events[0].startDate),
    events,
  }));

  return (
    <div className="space-y-6 pb-20">
      {groupedEvents.map((dateGroup) => (
        <EventDateGroup key={dateGroup.date} dateGroup={dateGroup} />
      ))}
    </div>
  );
}
