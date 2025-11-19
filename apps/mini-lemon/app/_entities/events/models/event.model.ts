import type { Doc } from "@mint-up/convex/_generated/dataModel";

// Define the type for events returned by getUserEvents
export type Event = Doc<"events"> & {
  creator: { name: string; imageUrl: string | null; username: string };
  imageUrl: string | null;
  tickets: Doc<"ticketTemplates">[];
  isHost: boolean;
  userStatus?: "pending" | "minted" | "rejected" | null;
};
