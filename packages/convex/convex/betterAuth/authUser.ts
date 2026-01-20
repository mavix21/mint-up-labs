import { v } from "convex/values";

import { mutation } from "./_generated/server";

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
