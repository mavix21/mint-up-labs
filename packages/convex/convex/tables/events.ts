import { defineTable } from "convex/server";
import { v } from "convex/values";

export const eventsTable = defineTable({
  name: v.string(),
  image: v.id("_storage"),
  description: v.optional(v.string()),
  startDate: v.number(),
  endDate: v.number(),
  creatorId: v.id("users"),
  organizationId: v.optional(v.id("organizations")),
  theme: v.optional(v.string()),
  isFeatured: v.boolean(),
  category: v.union(
    v.literal("music & performing arts"),
    v.literal("business & professional"),
    v.literal("food & drink"),
    v.literal("arts & culture"),
    v.literal("film & media"),
    v.literal("fashion & beauty"),
    v.literal("travel & outdoor"),
    v.literal("sports & fitness"),
    v.literal("health & wellness"),
    v.literal("tech"),
    v.literal("gaming"),
    v.literal("education & learning"),
    v.literal("community & causes"),
    v.literal("parties & socials"),
    v.literal("hobbies & interests"),
    v.literal("other"),
  ),
  location: v.union(
    v.object({
      type: v.literal("online"),
      url: v.string(),
    }),
    v.object({
      type: v.literal("in-person"),
      address: v.string(),
      instructions: v.optional(v.string()),
    }),
  ),
  visibility: v.union(v.literal("public"), v.literal("unlisted")),
  coHosts: v.array(
    v.object({
      userId: v.id("users"),
    }),
  ),

  // Registration metadata for performance optimization
  registrationCount: v.number(),
  recentRegistrations: v.array(
    v.object({
      userId: v.id("users"),
      pfpUrl: v.optional(v.string()),
      displayName: v.string(),
      registrationTime: v.number(),
      status: v.union(
        v.object({ type: v.literal("pending") }),
        v.object({ type: v.literal("approved") }),
        v.object({ type: v.literal("minted") }),
      ),
    }),
  ),

  onchainData: v.optional(
    v.union(
      v.object({
        status: v.literal("pending"),
      }),
      v.object({
        status: v.literal("synced"),
        eventId: v.string(), // onchain event id
        contractAddress: v.string(),
        chainId: v.number(),
      }),
    ),
  ),
})
  .index("by_creatorId", ["creatorId"])
  .index("by_organizationId", ["organizationId"])
  .index("by_startDate", ["startDate"])
  .searchIndex("search_events", {
    searchField: "name",
    filterFields: ["category"],
  });
