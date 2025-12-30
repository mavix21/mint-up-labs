import { defineTable } from "convex/server";
import { v } from "convex/values";

export const communitiesTable = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  logoUrl: v.optional(v.id("_storage")),
  creatorId: v.id("users"),
}).index("by_creatorId", ["creatorId"]);
