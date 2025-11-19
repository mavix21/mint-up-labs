"use client";

import { Globe, MapPin } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mint-up/ui/components/avatar";

import type { Event } from "@/app/_entities/events/models";
import { EventCard } from "@/app/_entities/events/ui/event-card";
import { isEventLive } from "@/app/_shared/lib/date/time";

import type { EventDateGroup } from "../models";
import { EventDetailsDrawer } from "./event-details-drawer";

interface EventDateGroupProps {
  dateGroup: EventDateGroup;
}

export function EventDateGroup({ dateGroup }: EventDateGroupProps) {
  const getEventTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventLocation = (event: Event) => {
    if (event.location.type === "online") {
      return "Online";
    }
    return event.location.address;
  };

  const getEventBadge = (event: Event) => {
    if (!isEventLive(event.startDate, event.endDate)) return undefined;
    return "LIVE";
  };

  return (
    <div className="relative pl-6">
      <div className="bg-border/30 absolute top-2 bottom-0 left-[9px] w-0.5" />

      <div className="bg-muted-foreground ring-background absolute top-2 left-[5px] h-2.5 w-2.5 rounded-full ring-4" />

      <div className="mb-3">
        <h2 className="text-muted-foreground text-base font-medium">
          <span className="text-foreground font-bold">{dateGroup.date}</span>{" "}
          <span className="opacity-80">{dateGroup.dayOfWeek}</span>
        </h2>
      </div>

      <div className="space-y-3">
        {dateGroup.events.map((event) => {
          const time = getEventTime(event.startDate);
          const location = getEventLocation(event);
          const badge = getEventBadge(event);

          return (
            <EventDetailsDrawer key={event._id} event={event}>
              <EventCard.Root variant="primary">
                <EventCard.Content>
                  <EventCard.Header>
                    {badge ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-orange-500 uppercase">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                        </span>
                        {badge}
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold tracking-wider text-orange-500 uppercase">
                        {time.split(" ")[0]} {time.split(" ")[1]}
                      </span>
                    )}
                    {badge && (
                      <span className="text-muted-foreground/40">•</span>
                    )}
                    {badge && <span>{time}</span>}
                  </EventCard.Header>

                  <EventCard.Title>{event.name}</EventCard.Title>

                  <EventCard.Meta>
                    <div className="flex items-center gap-2">
                      {location === "Online" ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      <span>{location}</span>
                    </div>
                  </EventCard.Meta>

                  <EventCard.Footer>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <Avatar
                            key={i}
                            className="border-background h-4 w-4 border"
                          >
                            <AvatarImage
                              src={`https://i.pravatar.cc/150?u=${event._id}${i}`}
                            />
                            <AvatarFallback className="text-[6px]">
                              U
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-muted-foreground text-[10px] font-medium">
                        +24 going
                      </span>
                    </div>
                  </EventCard.Footer>
                </EventCard.Content>

                <EventCard.Image src={event.imageUrl ?? ""} alt={event.name} />
              </EventCard.Root>
            </EventDetailsDrawer>
          );
        })}
      </div>
    </div>
  );
}
