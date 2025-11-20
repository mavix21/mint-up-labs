import { cn } from "@mint-up/ui/lib/utils";

import type { TicketTemplate } from "../utils/ticket-types";
import { isOffchainTicket } from "../utils/ticket-types";

interface FreeTicketCardProps {
  ticket: TicketTemplate;
  selected: boolean;
  onSelect: (ticketId: string) => void;
  disabled?: boolean;
}

export function FreeTicketCard({
  ticket,
  selected,
  onSelect,
  disabled = false,
}: FreeTicketCardProps) {
  if (!isOffchainTicket(ticket)) {
    return null;
  }

  return (
    <div
      onClick={() => !disabled && onSelect(ticket._id)}
      className={cn(
        "flex flex-row items-start gap-3 rounded-lg border p-3 transition-all",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        selected
          ? "bg-accent/50 border-primary/50"
          : "bg-card border-border hover:bg-accent/50",
      )}
    >
      <div className="mt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div
          className={cn(
            "flex aspect-square h-4 w-4 items-center justify-center rounded-full border",
            selected
              ? "border-primary text-primary"
              : "border-muted-foreground",
            disabled && "opacity-50",
          )}
        >
          {selected && <div className="bg-primary h-2 w-2 rounded-full" />}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div className="mr-2 flex-1">
            <p
              className={cn(
                "text-sm leading-tight",
                selected ? "text-foreground font-semibold" : "font-normal",
              )}
            >
              {ticket.name}
            </p>
            {ticket.description && (
              <p className="text-muted-foreground mt-1 text-xs font-light">
                {ticket.description}
              </p>
            )}
            {ticket.totalSupply && (
              <p className="text-muted-foreground mt-1 text-xs">
                {ticket.totalSupply} available
              </p>
            )}
          </div>

          <div className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Free
          </div>
        </div>
      </div>
    </div>
  );
}
