import { defineTable } from "convex/server";
import { v } from "convex/values";

export const registrationsTable = defineTable({
  userId: v.id("users"),
  eventId: v.id("events"),
  ticketTemplateId: v.id("ticketTemplates"),
  status: v.union(
    v.object({ type: v.literal("pending") }),
    v.object({
      type: v.literal("approved"),
      approvedAt: v.number(),
      nftTicket: v.optional(
        v.object({
          walletAddress: v.string(),
          transactionHash: v.string(),
          tokenId: v.string(),
        }),
      ),
    }),
    v.object({ type: v.literal("rejected") }),
    v.object({ type: v.literal("waitlisted") }),
    v.object({
      type: v.literal("checkedIn"),
      checkedInAt: v.number(),
    }),
  ),
  eventIntentions: v.optional(
    v.array(
      v.union(
        v.literal("Networking"),
        v.literal("Hiring Talent"),
        v.literal("Seeking Investment"),
        v.literal("Exploring Opportunities"),
        v.literal("Learning"),
      ),
    ),
  ),
  poapStatus: v.optional(
    v.union(
      v.object({
        type: v.literal("claimed"),
        transactionHash: v.string(),
        tokenId: v.string(),
        claimedAt: v.number(),
      }),
      v.object({
        type: v.literal("unclaimed"),
      }),
    ),
  ),
})
  .index("by_event", ["eventId"])
  .index("by_user_and_event", ["userId", "eventId"]);
