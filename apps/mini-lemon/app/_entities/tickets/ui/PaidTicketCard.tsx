import { Loader2 } from "lucide-react";

import { cn } from "@mint-up/ui/lib/utils";

import type { TicketTemplate } from "../utils/ticket-types";
import { isOnchainTicket, isTicketSynced } from "../utils/ticket-types";

interface PaidTicketCardProps {
  ticket: TicketTemplate;
  selected: boolean;
  onSelect: (ticketId: string) => void;
  disabled?: boolean;
  isTransactionPending?: boolean;
}

export function PaidTicketCard({
  ticket,
  selected,
  onSelect,
  disabled = false,
  isTransactionPending = false,
}: PaidTicketCardProps) {
  if (!isOnchainTicket(ticket)) {
    return null;
  }

  const isSynced = isTicketSynced(ticket);
  const { amount, currency } = ticket.ticketType.price;

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
            (disabled || !isSynced) && "opacity-50",
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
            {ticket.description !== "" && (
              <p className="text-muted-foreground mt-1 text-xs font-light">
                {ticket.description}
              </p>
            )}
            {ticket.totalSupply && (
              <p className="text-muted-foreground mt-1 text-xs">
                {ticket.totalSupply} available
              </p>
            )}

            {/* Sync status indicator */}
            {!isSynced && (
              <div className="mt-1 inline-block rounded-md bg-orange-100 px-2 py-1 dark:bg-orange-900/30">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                  Syncing to blockchain...
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            {/* Transaction pending indicator */}
            {isTransactionPending && selected && (
              <div className="bg-muted flex items-center gap-1 rounded-md px-2 py-1">
                <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />
                <p className="text-muted-foreground text-xs font-semibold">
                  Processing...
                </p>
              </div>
            )}
            <div className="rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              {amount} {currency}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
