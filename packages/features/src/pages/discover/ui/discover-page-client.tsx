"use client";

import * as React from "react";

import type { Event, EventCategory } from "../../../entities/event/model";
import { EventGroup } from "../../../entities/event/ui/event-group";
import { EventListCard } from "../../../entities/event/ui/event-list-card";
import { FeaturedEventCard } from "../../../entities/event/ui/featured-event-card";
import { CategoryFilter } from "./category-filter";
import { SectionHeader } from "./section-header";

interface Props {
  featuredEvents: Event[];
  upcomingEvents: Event[];
}

export function DiscoverPageClient({ featuredEvents, upcomingEvents }: Props) {
  const [selectedCategory, setSelectedCategory] = React.useState<
    EventCategory | "all"
  >("all");

  const filteredFeatured =
    selectedCategory === "all"
      ? featuredEvents
      : featuredEvents.filter((e) => e.category === selectedCategory);

  const filteredUpcoming =
    selectedCategory === "all"
      ? upcomingEvents
      : upcomingEvents.filter((e) => e.category === selectedCategory);

  return (
    <>
      {/* Category Filter - interactive */}
      <div className="mb-6">
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Featured Events */}
      <section className="mb-8">
        <SectionHeader title="Featured Events" href="/events?featured=true" />

        <div className="hide-scrollbar -mx-4 mt-4 overflow-x-auto px-4">
          <div className="flex gap-4 pb-2">
            {filteredFeatured.length > 0 ? (
              filteredFeatured.map((event) => (
                <FeaturedEventCard key={event._id} event={event} />
              ))
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No featured events in this category
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events with date grouping */}
      <section>
        <SectionHeader
          title="Upcoming Events"
          href="/events"
          actionLabel="View more"
        />

        <div className="mt-4">
          {filteredUpcoming.length > 0 ? (
            <EventGroup.Root events={filteredUpcoming}>
              {(groupedEvents) => (
                <div className="space-y-4">
                  {Array.from(groupedEvents.entries()).map(([date, events]) => (
                    <div key={date}>
                      <EventGroup.DateHeader date={date} className="mb-3" />
                      <EventGroup.List className="space-y-3">
                        {events.map((event) => (
                          <EventListCard key={event._id} event={event} />
                        ))}
                      </EventGroup.List>
                    </div>
                  ))}
                </div>
              )}
            </EventGroup.Root>
          ) : (
            <EventGroup.Empty message="No upcoming events in this category" />
          )}
        </div>
      </section>
    </>
  );
}
