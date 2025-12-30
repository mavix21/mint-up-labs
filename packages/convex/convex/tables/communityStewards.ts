import { defineTable } from "convex/server";
import { v } from "convex/values";

export const communityStewardsTable = defineTable({
  communityId: v.id("communities"),
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("moderator")),
})
  .index("by_communityId", ["communityId"])
  .index("by_userId", ["userId"]);
