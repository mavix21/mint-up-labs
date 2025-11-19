import { defineTable } from "convex/server";
import { v } from "convex/values";

export const sessionsTable = defineTable({
  // Manejo de sesiones para mantener a los usuarios logueados.
  userId: v.id("users"),
  sessionToken: v.string(),
  expiresAt: v.number(), // Timestamp de expiración
}).index("by_sessionToken", ["sessionToken"]);
