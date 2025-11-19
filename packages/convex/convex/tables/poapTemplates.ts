import { defineTable } from "convex/server";
import { v } from "convex/values";

export const poapTemplatesTable = defineTable({
  eventId: v.id("events"),
  name: v.string(),
  description: v.optional(v.string()),
  nft: v.object({
    image: v.id("_storage"),
    metadata: v.optional(v.any()),
  }),
}).index("by_eventId", ["eventId"]);
