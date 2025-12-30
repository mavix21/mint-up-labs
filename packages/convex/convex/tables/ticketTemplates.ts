import { defineTable } from "convex/server";
import { v } from "convex/values";

export const ticketTemplatesTable = defineTable({
  eventId: v.id("events"),
  name: v.string(),
  description: v.optional(v.string()),
  totalSupply: v.optional(v.number()),
  isApprovalRequired: v.boolean(),
  ticketType: v.union(
    v.object({ type: v.literal("offchain") }),
    v.object({
      type: v.literal("onchain"),
      price: v.object({
        amount: v.number(),
        currency: v.union(v.literal("USDC")),
      }),
      syncStatus: v.union(
        v.object({ status: v.literal("pending") }),
        v.object({
          status: v.literal("synced"),
          tokenId: v.string(),
          contractAddress: v.string(),
          chainId: v.number(),
          nft: v.object({
            metadataURI: v.string(),
          }),
        }),
        v.object({ status: v.literal("error"), error: v.string() }),
      ),
    }),
  ),
}).index("by_eventId", ["eventId"]);
