import { defineTable } from "convex/server";
import { v } from "convex/values";

import { PROFESSIONAL_PROFILE_ROLES } from "../constants/professionalProfile";

const professionalRoleValidators = PROFESSIONAL_PROFILE_ROLES.map((role) =>
  v.literal(role),
);

export const usersTable = defineTable({
  username: v.string(),
  pfpUrl: v.string(),
  displayName: v.optional(v.string()),
  bio: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerified: v.optional(v.number()),
  currentWalletAddress: v.optional(v.string()),
  profileInitializedAt: v.optional(v.number()),
  socials: v.optional(
    v.object({
      x: v.optional(v.string()),
      linkedin: v.optional(v.string()),
    }),
  ),
  professionalProfile: v.optional(
    v.object({
      worksAt: v.optional(v.string()),
      roles: v.optional(v.array(v.union(...professionalRoleValidators))),
      professionalLink: v.optional(v.string()),
    }),
  ),
})
  .index("by_currentWalletAddress", ["currentWalletAddress"])
  .index("by_email", ["email"]);
