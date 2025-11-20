import type { Doc } from "@mint-up/convex/_generated/dataModel";
import { cn } from "@mint-up/ui/lib/utils";

import { getTicketPrice } from "../utils/ticket-types";

interface ItemProps {
  ticket: Doc<"ticketTemplates">;
  setValue: (value: string) => void;
  selected: boolean;
}

export function TicketCardRadioButton({
  ticket,
  setValue,
  selected,
}: ItemProps) {
  const price = getTicketPrice(ticket);

  return (
    <div
      onClick={() => setValue(ticket._id)}
      className={cn(
        "flex cursor-pointer flex-row items-start gap-3 rounded-lg border p-3 transition-all",
        selected
          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20"
          : "bg-card border-border hover:bg-accent/50",
      )}
    >
      <div className="mt-0.5 shrink-0">
        <div
          className={cn(
            "flex aspect-square h-4 w-4 items-center justify-center rounded-full border",
            selected
              ? "border-blue-500 text-blue-500"
              : "border-muted-foreground",
          )}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-blue-500" />}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div className="mr-2 flex-1">
            <p
              className={cn(
                "text-sm leading-tight",
                selected
                  ? "font-semibold text-blue-700 dark:text-blue-300"
                  : "font-normal",
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

          <div
            className={cn(
              "rounded-md px-2 py-1 text-xs font-semibold",
              price === "Free"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            )}
          >
            {price}
          </div>
        </div>
      </div>
    </div>
  );
}
