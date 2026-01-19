import { EventCardAttendees } from "./event-card-attendees";
import { EventCardContent } from "./event-card-content";
import { EventCardDateBadge } from "./event-card-date-badge";
import { EventCardImage } from "./event-card-image";
import { EventCardLocation } from "./event-card-location";
import { EventCardOrganizer } from "./event-card-organizer";
import { EventCardPrice } from "./event-card-price";
import { EventCardRoot } from "./event-card-root";
import { EventCardTime } from "./event-card-time";
import { EventCardTitle } from "./event-card-title";
import { EventCardWaitlistBadge } from "./event-card-waitlist-badge";

export const EventCard = {
  Root: EventCardRoot,
  Image: EventCardImage,
  DateBadge: EventCardDateBadge,
  Attendees: EventCardAttendees,
  Content: EventCardContent,
  Title: EventCardTitle,
  Location: EventCardLocation,
  Price: EventCardPrice,
  Time: EventCardTime,
  Organizer: EventCardOrganizer,
  WaitlistBadge: EventCardWaitlistBadge,
};

export { useEventCardContext } from "./event-card-context";
