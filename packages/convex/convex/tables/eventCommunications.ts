import { defineTable } from "convex/server";
import { v } from "convex/values";

export const eventCommunicationsTable = defineTable({
  // Historial de casts enviados desde el Farcaster Hub.
  eventId: v.id("events"),
  authorId: v.id("users"),
  content: v.string(),
  farcasterCastHash: v.optional(v.string()),
  targetChannel: v.optional(v.string()),
}).index("by_eventId", ["eventId"]);
