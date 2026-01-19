"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mint-up/ui/components/avatar";
import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardOrganizerProps {
  className?: string;
  showAvatar?: boolean;
}

export function EventCardOrganizer({
  className,
  showAvatar = true,
}: EventCardOrganizerProps) {
  // const { event } = useEventCardContext();

  const organizer = { name: "Organizer Name", avatar: null }; // Placeholder until data model is updated

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showAvatar && (
        <Avatar className="size-5">
          <AvatarImage
            src={organizer.avatar ?? "/placeholder.svg"}
            alt={organizer.name}
          />
          <AvatarFallback className="text-[10px]">
            {organizer.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="text-muted-foreground line-clamp-1 text-sm">
        By {organizer.name}
      </span>
    </div>
  );
}
