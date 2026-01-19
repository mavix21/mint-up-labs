import type { Doc } from "@mint-up/convex/_generated/dataModel";

export type Event = Omit<Doc<"events">, "_creationTime">;
