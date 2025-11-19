import { omit } from 'convex-helpers';
import { internalMutation, internalQuery, mutation, query } from './_generated/server';
import { vv } from './schema';
import { ConvexError, v } from 'convex/values';

import { PROFESSIONAL_PROFILE_ROLES } from './constants/professionalProfile';
import type { ProfessionalProfileRole } from './constants/professionalProfile';
import type { Doc } from './_generated/dataModel';

export const insertUserByFid = mutation({
  args: {
    ...omit(vv.doc('users').fields, ['_id', '_creationTime']),
    currentWalletAddress: v.optional(v.string()),
    fid: v.number(),
    initializedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const linkedAccount = await ctx.db
      .query('linkedAccounts')
      .withIndex('by_farcaster_fid', (q) => q.eq('account.fid', args.fid))
      .unique();

    if (linkedAccount) {
      const user = await ctx.db.get(linkedAccount.userId);
      if (!user) {
        throw new ConvexError({
          message: 'User not found',
        });
      }
      // await ctx.db.patch(linkedAccount.userId, {
      //   username: args.username,
      //   pfpUrl: args.pfpUrl,
      //   displayName: args.displayName,
      //   bio: args.bio,
      //   currentWalletAddress: args.currentWalletAddress,
      // });
      // await ctx.db.patch(linkedAccount._id, {
      //   linkedAt: Date.now(),
      // });
      return linkedAccount.userId;
    }

    const userId = await ctx.db.insert('users', {
      username: args.username,
      pfpUrl: args.pfpUrl,
      displayName: args.displayName,
      bio: args.bio,
      currentWalletAddress: args.currentWalletAddress,
      profileInitializedAt: args.initializedAt,
    });

    await ctx.db.insert('linkedAccounts', {
      account: {
        protocol: 'farcaster',
        fid: args.fid,
        username: args.username,
        pfpUrl: args.pfpUrl,
        displayName: args.displayName,
        bio: args.bio,
        lastSyncedAt: args.initializedAt,
      },
      userId,
      linkedAt: Date.now(),
    });

    return userId;
  },
});

export const getUserByFid = query({
  args: {
    fid: v.number(),
  },
  handler: async (ctx, args) => {
    const linkedAccount = await ctx.db
      .query('linkedAccounts')
      .withIndex('by_farcaster_fid', (q) => q.eq('account.fid', args.fid))
      .unique();

    if (!linkedAccount) {
      return null;
    }

    const user = await ctx.db.get(linkedAccount.userId);

    if (!user) {
      return null;
    }

    return {
      displayName: user.displayName,
      username: user.username,
      pfpUrl: user.pfpUrl,
      bio: user.bio,
      currentWalletAddress: user.currentWalletAddress,
      fid: args.fid,
      userId: user._id,
      linkedAt: linkedAccount.linkedAt,
    };
  },
});

export const getUserById = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Query para obtener un usuario por su ID de la tabla 'users'
export const get = internalQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id('users'),
    bio: v.optional(v.string()),
    displayName: v.optional(v.string()),
    username: v.optional(v.string()),
    pfpUrl: v.optional(v.string()),
    currentWalletAddress: v.optional(v.string()),
    professionalProfile: v.optional(
      v.object({
        worksAt: v.optional(v.string()),
        roles: v.optional(v.array(v.string())),
        professionalLink: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, professionalProfile, ...updateFields } = args;

    // Check if user exists
    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      throw new ConvexError({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const fieldsToUpdate: Partial<Doc<'users'>> = {};

    if (updateFields.bio !== undefined) {
      fieldsToUpdate.bio = updateFields.bio;
    }

    if (updateFields.displayName !== undefined) {
      fieldsToUpdate.displayName = updateFields.displayName;
    }

    if (updateFields.username !== undefined) {
      fieldsToUpdate.username = updateFields.username;
    }

    if (updateFields.pfpUrl !== undefined) {
      fieldsToUpdate.pfpUrl = updateFields.pfpUrl;
    }

    if (updateFields.currentWalletAddress !== undefined) {
      fieldsToUpdate.currentWalletAddress = updateFields.currentWalletAddress;
    }

    if (professionalProfile !== undefined) {
      const sanitizedProfessionalProfile = sanitizeProfessionalProfile(professionalProfile);

      if (sanitizedProfessionalProfile !== null) {
        fieldsToUpdate.professionalProfile = sanitizedProfessionalProfile;
      }
    }

    // Only proceed if there are fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new ConvexError({
        message: 'No fields provided for update',
        code: 'NO_UPDATE_FIELDS',
      });
    }

    await ctx.db.patch(userId, fieldsToUpdate);
  },
});

const PROFESSIONAL_PROFILE_ROLE_SET = new Set<ProfessionalProfileRole>(PROFESSIONAL_PROFILE_ROLES);

const isValidProfessionalRole = (role: string): role is ProfessionalProfileRole =>
  PROFESSIONAL_PROFILE_ROLE_SET.has(role as ProfessionalProfileRole);

type ProfessionalProfileInput = {
  worksAt?: string;
  roles?: string[];
  professionalLink?: string;
};

type SanitizedProfessionalProfile = {
  worksAt?: string;
  roles?: ProfessionalProfileRole[];
  professionalLink?: string;
};

const sanitizeProfessionalProfile = (
  profile: ProfessionalProfileInput
): SanitizedProfessionalProfile | null => {
  const sanitized: SanitizedProfessionalProfile = {};

  if (profile.worksAt !== undefined) {
    const trimmed = profile.worksAt.trim();

    if (trimmed.length > 100) {
      throw new ConvexError({
        message: 'Company or protocol name must be less than 100 characters',
        code: 'INVALID_PROFESSIONAL_PROFILE',
      });
    }

    sanitized.worksAt = trimmed.length === 0 ? undefined : trimmed;
  }

  if (profile.roles !== undefined) {
    const uniqueRoles = Array.from(new Set(profile.roles));
    const typedRoles = uniqueRoles.filter(isValidProfessionalRole);

    if (typedRoles.length !== uniqueRoles.length) {
      throw new ConvexError({
        message: 'One or more roles are not supported',
        code: 'INVALID_PROFESSIONAL_PROFILE',
      });
    }

    sanitized.roles = typedRoles;
  }

  if (profile.professionalLink !== undefined) {
    const trimmed = profile.professionalLink.trim();

    if (trimmed.length === 0) {
      sanitized.professionalLink = undefined;
    } else {
      if (trimmed.length > 2048) {
        throw new ConvexError({
          message: 'Professional link is too long',
          code: 'INVALID_PROFESSIONAL_PROFILE',
        });
      }

      if (!/^https?:\/\//i.test(trimmed)) {
        throw new ConvexError({
          message: 'Professional link must start with http or https',
          code: 'INVALID_PROFESSIONAL_PROFILE',
        });
      }

      sanitized.professionalLink = trimmed;
    }
  }

  return Object.keys(sanitized).length === 0 ? null : sanitized;
};

/**
 * Updates user social media links
 */
export const updateUserSocials = mutation({
  args: {
    userId: v.id('users'),
    socials: v.object({
      x: v.optional(v.string()),
      linkedin: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, socials } = args;

    // Check if user exists
    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      throw new ConvexError({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Validate URL formats if provided
    const urlRegex = /^https?:\/\/.+/;
    if (socials.x && !urlRegex.test(socials.x)) {
      throw new ConvexError({
        message: 'Invalid X (Twitter) URL format',
        code: 'INVALID_URL',
      });
    }

    if (socials.linkedin && !urlRegex.test(socials.linkedin)) {
      throw new ConvexError({
        message: 'Invalid LinkedIn URL format',
        code: 'INVALID_URL',
      });
    }

    await ctx.db.patch(userId, { socials });
  },
});

/**
 * Internal mutation to update user profile with Neynar data
 * This is specifically for syncing user information from Farcaster/Neynar
 */
export const updateUserProfileInternalWithFarcaster = internalMutation({
  args: {
    userId: v.id('users'),
    fid: v.number(),
    bio: v.optional(v.string()),
    displayName: v.optional(v.string()),
    username: v.optional(v.string()),
    pfpUrl: v.optional(v.string()),
    linkedAccountId: v.id('linkedAccounts'),
  },
  handler: async (ctx, args) => {
    const { userId, linkedAccountId, fid, ...updateFields } = args;

    // Filter out undefined values to avoid removing fields unintentionally
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateFields).filter(([_, value]) => value !== undefined)
    );

    // Only proceed if there are fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      console.warn(`No fields provided for update for user ${userId}`);
      return;
    }

    await ctx.db.patch(linkedAccountId, {
      account: {
        protocol: 'farcaster',
        fid,
        ...fieldsToUpdate,
        lastSyncedAt: Date.now(),
      },
    });
    await ctx.db.patch(userId, fieldsToUpdate);
  },
});
