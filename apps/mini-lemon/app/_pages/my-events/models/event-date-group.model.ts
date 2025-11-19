import type { Event } from "@/app/_entities/events/models";

export interface EventDateGroup {
  date: string;
  dayOfWeek: string;
  events: Event[];
}
