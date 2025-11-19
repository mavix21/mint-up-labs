"use client";

import { useState } from "react";

import { EventsList } from "./events-list";
import { EventsTabs } from "./events-tabs";

export type EventTab = "upcoming" | "past";

export function EventsContainer() {
  const [activeTab, setActiveTab] = useState<EventTab>("upcoming");

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-balance">
          My Events
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          Your digital experiences collection
        </p>
      </div>

      <EventsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <EventsList tab={activeTab} />
    </div>
  );
}
