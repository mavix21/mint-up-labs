import type { Event } from "../../model";
import { EventCard } from "../event-card";

interface EventListCardProps {
  event: Event;
}

export function EventListCard({ event }: EventListCardProps) {
  return (
    <EventCard.Root event={event} variant="list">
      {/* Left content */}
      <EventCard.Content>
        <EventCard.Time />
        <EventCard.Title lineClamp={2} />
        <EventCard.Organizer />
        <EventCard.Location />

        {/* Bottom row with waitlist badge and attendees */}
        <div className="mt-1 flex items-center gap-2">
          <EventCard.WaitlistBadge />
          <EventCard.Attendees size="sm" />
        </div>
      </EventCard.Content>

      {/* Right image with like button overlay */}
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
        <EventCard.Image
          aspectRatio="square"
          className="h-full w-full rounded-xl"
        />
      </div>
    </EventCard.Root>
  );
}
