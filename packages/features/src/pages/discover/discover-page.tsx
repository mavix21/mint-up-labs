import type { Event } from "../../entities/event/model";

import { DiscoverPageClient } from "./ui/discover-page-client";

export function DiscoverPage() {
  const featuredEvents = [] as Event[];
  const upcomingEvents = [] as Event[];

  return (
    <main className="mx-auto max-w-md px-4 py-4">
      {/* Client shell for category filter state */}
      <DiscoverPageClient
        featuredEvents={featuredEvents}
        upcomingEvents={upcomingEvents}
      />
    </main>
  );
}
