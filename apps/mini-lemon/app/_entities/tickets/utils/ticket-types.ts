import type { Doc } from "@mint-up/convex/_generated/dataModel";

export type TicketTemplate = Doc<"ticketTemplates">;

// Type guards for ticket discrimination
export const isOffchainTicket = (
  ticket: TicketTemplate,
): ticket is TicketTemplate & {
  ticketType: { type: "offchain" };
} => {
  return ticket.ticketType.type === "offchain";
};

export const isOnchainTicket = (
  ticket: TicketTemplate,
): ticket is TicketTemplate & {
  ticketType: {
    type: "onchain";
    price: { amount: number; currency: string };
    syncStatus: {
      status: "pending" | "synced" | "error";
      tokenId?: string;
      contractAddress?: string;
      chainId?: number;
      nft?: { metadataURI: string };
      error?: string;
    };
  };
} => {
  return ticket.ticketType.type === "onchain";
};

// Helper functions
export const getTicketPrice = (ticket: TicketTemplate): string => {
  if (isOffchainTicket(ticket)) {
    return "Free";
  }

  if (isOnchainTicket(ticket)) {
    const { amount, currency } = ticket.ticketType.price;
    return `${amount} ${currency}`;
  }

  return "Price not available";
};

export const isTicketFree = (ticket: TicketTemplate): boolean => {
  return isOffchainTicket(ticket);
};

export const isTicketPaid = (ticket: TicketTemplate): boolean => {
  return isOnchainTicket(ticket);
};

export const getTicketSyncStatus = (ticket: TicketTemplate) => {
  if (isOnchainTicket(ticket)) {
    return ticket.ticketType.syncStatus;
  }
  return null;
};

export const isTicketSynced = (ticket: TicketTemplate): boolean => {
  if (isOnchainTicket(ticket)) {
    return ticket.ticketType.syncStatus.status === "synced";
  }
  return false;
};
