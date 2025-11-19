import { v } from 'convex/values';
import { internalQuery, mutation } from './_generated/server';

export const store = mutation({
  args: {
    fid: v.string(),
    notificationUrl: v.string(),
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const existingToken = await ctx.db
      .query('notificationTokens')
      .withIndex('by_fid', (q) => q.eq('fid', args.fid))
      .unique();

    if (existingToken) {
      await ctx.db.patch(existingToken._id, {
        notificationUrl: args.notificationUrl,
        token: args.token,
      });
      console.log(`Token de notificación actualizado para el FID: ${args.fid}`);
      return existingToken._id;
    } else {
      const newId = await ctx.db.insert('notificationTokens', {
        fid: args.fid,
        notificationUrl: args.notificationUrl,
        token: args.token,
      });
      console.log(`Nuevo token de notificación almacenado para el FID: ${args.fid}`);
      return newId;
    }
  },
});

export const get = internalQuery({
  args: { fid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('notificationTokens')
      .withIndex('by_fid', (q) => q.eq('fid', args.fid))
      .unique();
  },
});
