import { defineTable } from "convex/server";
import { v } from "convex/values";

export const notificationTokensTable = defineTable({
  fid: v.string(), // Farcaster ID del usuario
  notificationUrl: v.string(),
  token: v.string(),
}).index("by_fid", ["fid"]);
