import { v } from "convex/values";

import { createAuth } from "../auth";
import { mutation } from "./_generated/server";

// Export a static instance for Better Auth schema generation
export const auth = createAuth({} as any);

export const setUserId = mutation({
  args: {
    authId: v.id("user"),
    userId: v.string(),
  },
  handler: async (ctx, { authId, userId }) => {
    await ctx.db.patch(authId, {
      userId: userId,
    });
  },
});
