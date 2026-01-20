"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mint-up/ui/components/avatar";

import type { Event } from "../../model";
import { EventCard } from "../event-card";

interface FeaturedEventCardProps {
  event: Event;
}

export function FeaturedEventCard({ event }: FeaturedEventCardProps) {
  const attendees = [] as { id: string; name: string; pfpUrl?: string }[];
  return (
    <EventCard.Root event={event} variant="featured">
      {/* Image with overlays */}
      <EventCard.Image aspectRatio="portrait" className="rounded-t-2xl">
        {/* Date badge - top left */}
        <EventCard.DateBadge className="absolute top-3 left-3" />

        {/* Like button - top right */}
        {/* <button
          onClick={(e) => {
            e.preventDefault();
          }}
          className="bg-background/90 hover:bg-background absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground",
            )}
          />
        </button> */}

        {/* Attendees - bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center">
          <div className="flex -space-x-2">
            {attendees.slice(0, 4).map((attendee) => (
              <Avatar
                key={attendee.id}
                className="border-background h-7 w-7 border-2"
              >
                <AvatarImage
                  src={attendee.pfpUrl ?? "/placeholder.svg"}
                  alt={attendee.name}
                />
                <AvatarFallback>{attendee.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {attendees.length > 4 && (
            <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
              +{attendees.length - 4}
            </span>
          )}
        </div>
      </EventCard.Image>

      {/* Content section */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <EventCard.Title />
          <EventCard.Price />
        </div>
        <EventCard.Location />
      </div>
    </EventCard.Root>
  );
}
