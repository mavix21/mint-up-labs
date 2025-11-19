import { defineTable } from "convex/server";
import { v } from "convex/values";

export const organizationMembersTable = defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("member")),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_userId", ["userId"]);
