import * as React from "react";

import type { Event } from "../../model";

interface EventCardContextValue {
  event: Event;
}

export const EventCardContext =
  React.createContext<EventCardContextValue | null>(null);

export function useEventCardContext() {
  const context = React.use(EventCardContext);
  if (!context) {
    throw new Error("EventCard components must be used within EventCard.Root");
  }
  return context;
}
