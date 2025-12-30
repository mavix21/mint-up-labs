import { Schema } from "effect";

export const EventId = Schema.UUID.pipe(Schema.brand("EventId"));
export type EventId = Schema.Schema.Type<typeof EventId>;

export const EventSlug = Schema.String.pipe(
  Schema.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  Schema.length({ min: 3, max: 128 }),
  Schema.brand("EventSlug"),
);
export type EventSlug = Schema.Schema.Type<typeof EventSlug>;

export const VirtualPlatform = Schema.Literal(
  "Zoom",
  "Teams",
  "GoogleMeet",
  "TwitterSpace",
  "Custom",
);
export const VirtualLocation = Schema.TaggedStruct("Virtual", {
  url: Schema.URL,
  platform: VirtualPlatform,
});
export const VenueLocation = Schema.TaggedStruct("Venue", {
  name: Schema.NonEmptyString,
  address: Schema.NonEmptyString,
  description: Schema.optional(Schema.NonEmptyString),
});
export const HybridLocation = Schema.TaggedStruct("Hybrid", {
  venue: VenueLocation,
  virtual: VirtualLocation,
});

export class Event extends Schema.Class<Event>("@/domain/ems/Event")({
  id: EventId,
  slug: EventSlug,
  title: Schema.NonEmptyString,
  start: Schema.DateTimeZoned,
}) {}
