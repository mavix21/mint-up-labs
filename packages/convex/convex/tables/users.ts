import { defineTable } from "convex/server";
import { v } from "convex/values";

export const usersTable = defineTable({
  // Reference to the betterAuth component user._id
  authId: v.string(),
  // Sync fields from auth user (optional, add what you need)
  // email: v.string(),

  // Add any app-specific user fields here
  socials: v.optional(
    v.object({
      x: v.optional(v.string()),
      linkedin: v.optional(v.string()),
    }),
  ),
  professionalProfile: v.optional(
    v.object({
      worksAt: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      professionalLink: v.optional(v.string()),
    }),
  ),
}).index("by_authId", ["authId"]);
