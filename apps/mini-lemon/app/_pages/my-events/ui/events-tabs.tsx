import { Tabs, TabsList, TabsTrigger } from "@mint-up/ui/components/tabs";

import type { EventTab } from "./events-container";

interface EventsTabsProps {
  activeTab: EventTab;
  onTabChange: (tab: EventTab) => void;
}

export function EventsTabs({ activeTab, onTabChange }: EventsTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as EventTab)}
      className="mb-4"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upcoming" className="text-sm font-medium">
          Upcoming
        </TabsTrigger>
        <TabsTrigger value="past" className="text-sm font-medium">
          Past
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
