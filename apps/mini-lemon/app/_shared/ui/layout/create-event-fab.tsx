"use client";

import { Plus } from "lucide-react";

import { Button } from "@mint-up/ui/components/button";
import { cn } from "@mint-up/ui/lib/utils";

interface CreateEventFabProps {
  className?: string;
}

export function CreateEventFab({ className }: CreateEventFabProps) {
  return (
    <Button
      size="icon"
      className={cn(
        "bg-primary hover:bg-primary/90 shadow-primary/25 right-6 bottom-28 z-40 h-14 w-14 rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95",
        className,
      )}
      onClick={() => {
        console.log("[v0] Create event button clicked");
      }}
    >
      <Plus className="text-primary-foreground h-6 w-6" />
      <span className="sr-only">Create Event</span>
    </Button>
  );
}
