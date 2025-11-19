import { v } from 'convex/values';
import { internalQuery, query } from './_generated/server';

export const getFidByUserId = internalQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const linkedAccount = await ctx.db
      .query('linkedAccounts')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('account.protocol'), 'farcaster'))
      .unique();

    if (linkedAccount && linkedAccount.account.protocol === 'farcaster') {
      return linkedAccount.account.fid;
    }

    return null;
  },
});

export const getLinkedAccountsByUserId = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const linkedAccounts = await ctx.db
      .query('linkedAccounts')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();

    return linkedAccounts;
  },
});
