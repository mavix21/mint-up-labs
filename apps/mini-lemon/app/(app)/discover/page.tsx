"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { api } from "@mint-up/convex/_generated/api";
import { useQuery } from "@mint-up/convex/react";
import { Badge } from "@mint-up/ui/components/badge";
import { Input } from "@mint-up/ui/components/input";
import { cn } from "@mint-up/ui/lib/utils";

import { EventDateGroup } from "@/app/_pages/my-events/ui/event-date-group";

import { groupEventsByDate } from "./utils";

const CATEGORIES = [
  "All",
  "music & performing arts",
  "business & professional",
  "arts & culture",
  "tech",
];

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const events = useQuery(api.events.searchEvents, {
    searchTerm: searchTerm || undefined,
    category: selectedCategory === "All" ? undefined : selectedCategory,
  });

  const groupedEvents = events ? groupEventsByDate(events) : [];
  const totalEvents = events?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
        <Input
          placeholder="Search events..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            className={cn(
              "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === category
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary/50 hover:bg-secondary/80 text-muted-foreground",
            )}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="space-y-6">
        <div className="text-muted-foreground text-sm font-medium">
          {totalEvents} events found
        </div>

        {groupedEvents.map((group) => (
          <EventDateGroup
            key={group.date + group.dayOfWeek}
            dateGroup={group}
          />
        ))}

        {events?.length === 0 && (
          <div className="text-muted-foreground py-10 text-center">
            No events found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
