import { defineTable } from "convex/server";
import { v } from "convex/values";

export const linkedAccountsTable = defineTable({
  userId: v.id("users"),
  account: v.union(
    v.object({
      protocol: v.literal("farcaster"),
      fid: v.number(),
      username: v.optional(v.string()),
      pfpUrl: v.optional(v.string()),
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      lastSyncedAt: v.optional(v.number()),
    }),
    v.object({
      protocol: v.literal("wallet"),
      address: v.string(),
    }),
    v.object({
      protocol: v.literal("email"),
      email: v.string(),
    }),
    v.object({
      protocol: v.literal("phone"),
      phone: v.string(),
    }),
  ),
  linkedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_farcaster_fid", ["account.fid"]) // Índice específico para buscar por FID
  .index("by_wallet_address", ["account.address"]); // Índice específico para buscar por dirección de wallet
