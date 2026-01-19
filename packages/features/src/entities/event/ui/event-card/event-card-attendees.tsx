import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mint-up/ui/components/avatar";
import { cn } from "@mint-up/ui/lib/utils";

import { useEventCardContext } from "./event-card-context";

interface EventCardAttendeesProps {
  className?: string;
  maxVisible?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export function EventCardAttendees({
  className,
  maxVisible: _maxVisible = 5,
  size = "md",
  showCount = true,
}: EventCardAttendeesProps) {
  const { event } = useEventCardContext();

  const visibleAttendees = event.recentRegistrations;
  const remainingCount = event.registrationCount - visibleAttendees.length;

  const sizeStyles = {
    sm: "h-6 w-6",
    md: "h-7 w-7",
  };

  if (visibleAttendees.length === 0) return null;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {visibleAttendees.map((attendee, index) => (
          <Avatar
            key={attendee.userId}
            className={cn(sizeStyles[size], "border-background border-2")}
            style={{ zIndex: visibleAttendees.length - index }}
          >
            <AvatarImage
              src={attendee.pfpUrl ?? "/placeholder.svg"}
              alt={attendee.displayName}
            />
            <AvatarFallback className="text-[10px]">
              {attendee.displayName[0]}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {showCount && remainingCount > 0 && (
        <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
