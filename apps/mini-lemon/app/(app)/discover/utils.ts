import type { Event } from "@/app/_entities/events/models";
import type { EventDateGroup } from "@/app/_pages/my-events/models/event-date-group.model";

export function groupEventsByDate(events: Event[]): EventDateGroup[] {
  const groups: Record<string, EventDateGroup> = {};

  events.forEach((event) => {
    const date = new Date(event.startDate);
    // Use YYYY-MM-DD for sorting key
    const key = date.toISOString().split("T")[0];

    if (!groups[key]) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let displayDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      const displayDay = date.toLocaleDateString("en-US", { weekday: "long" });

      // Reset times for accurate date comparison
      const dateNoTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const todayNoTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const tomorrowNoTime = new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
      );

      if (dateNoTime.getTime() === todayNoTime.getTime()) {
        displayDate = "Today";
      } else if (dateNoTime.getTime() === tomorrowNoTime.getTime()) {
        displayDate = "Tomorrow";
      }

      groups[key] = {
        date: displayDate,
        dayOfWeek: displayDay,
        events: [],
      };
    }
    groups[key].events.push(event);
  });

  // Sort groups by date key and return values
  return Object.keys(groups)
    .sort()
    .map((key) => groups[key]);
}
