import { ConvexError, v } from 'convex/values';
import { internalAction, mutation } from './_generated/server';
import { internal } from './_generated/api';

interface User {
  object: string;
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  active_status: string;
  power_badge: boolean;
}

interface BulkUsersResponse {
  users: User[];
}

/**
 * Public mutation to sync user information with Farcaster
 * This finds the user's FID and triggers the internal sync action
 */
export const syncWithFarcaster = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db.get(args.userId);
    if (!existingUser) {
      throw new ConvexError({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Find the user's Farcaster linked account to get their FID
    const linkedAccount = await ctx.db
      .query('linkedAccounts')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('account.protocol'), 'farcaster'))
      .unique();

    if (!linkedAccount || linkedAccount.account.protocol !== 'farcaster') {
      return;
    }

    // Schedule the internal action to sync with Farcaster
    await ctx.scheduler.runAfter(0, internal.farcaster.syncUserInformationWithFarcaster, {
      userId: args.userId,
      fid: linkedAccount.account.fid,
      linkedAccountId: linkedAccount._id,
    });
  },
});

export const syncUserInformationWithFarcaster = internalAction({
  args: {
    userId: v.id('users'),
    fid: v.number(),
    linkedAccountId: v.id('linkedAccounts'),
  },
  handler: async (ctx, args) => {
    if (!process.env.NEYNAR_API_KEY) {
      throw new Error('Missing required environment variables for Neynar interaction.');
    }

    try {
      // Construct the correct API URL with FID parameter
      const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${args.fid}`;
      const options: RequestInit = {
        method: 'GET',
        headers: {
          'x-api-key': process.env.NEYNAR_API_KEY,
          'Content-Type': 'application/json',
        },
      };

      console.log(`Fetching Farcaster data for FID ${args.fid}...`);
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
      }

      const data: BulkUsersResponse = await response.json();

      // Validate the response structure
      if (!data || !data.users || !Array.isArray(data.users) || data.users.length === 0) {
        console.warn(`No user data returned from Neynar for FID ${args.fid}`);
        throw new Error(`No user found for FID ${args.fid}`);
      }

      const neynarUser = data.users[0];

      // Validate that we have the user data
      if (!neynarUser) {
        throw new Error(`Invalid user data returned for FID ${args.fid}`);
      }

      // Extract user data with safe property access
      const updateData = {
        username: neynarUser.username || undefined,
        pfpUrl: neynarUser.pfp_url || undefined,
        displayName: neynarUser.display_name || undefined,
        bio: neynarUser.profile?.bio?.text || undefined,
      };

      // Filter out undefined values to only update fields that have data
      const fieldsToUpdate = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      ) as {
        username?: string;
        pfpUrl?: string;
        displayName?: string;
        bio?: string;
      };

      if (Object.keys(fieldsToUpdate).length === 0) {
        console.log(`No valid data to update for user ${args.userId}`);
        return;
      }

      // Use internal mutation to update user profile since this is an internalAction
      await ctx.runMutation(internal.users.updateUserProfileInternalWithFarcaster, {
        userId: args.userId,
        fid: args.fid,
        linkedAccountId: args.linkedAccountId,
        ...fieldsToUpdate,
      });

      console.log(
        `Successfully synced user ${args.userId} with Farcaster data for FID ${args.fid}`
      );
    } catch (error) {
      console.error('Error syncing user information with Farcaster:', error);
      // Re-throw with more specific error message
      throw new Error(
        `Failed to sync user information with Farcaster: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },
});
