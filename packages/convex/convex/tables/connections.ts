import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Connections table stores QR-based "proof of connection" between attendees at events.
 * Each connection is bidirectional but stored once, with initiator and acceptor roles.
 */
export const connectionsTable = defineTable({
  eventId: v.id("events"),
  initiatorUserId: v.id("users"),
  acceptorUserId: v.id("users"),
  connectionToken: v.string(), // Unique token for QR code verification
  status: v.union(
    v.object({ type: v.literal("pending"), expiresAt: v.number() }),
    v.object({ type: v.literal("confirmed"), confirmedAt: v.number() }),
    v.object({ type: v.literal("expired") }),
  ),
})
  .index("by_event_and_initiator", ["eventId", "initiatorUserId"])
  .index("by_event_and_acceptor", ["eventId", "acceptorUserId"])
  .index("by_event_and_users", ["eventId", "initiatorUserId", "acceptorUserId"])
  .index("by_connection_token", ["connectionToken"]);
