import { v } from 'convex/values';

import { query } from './_generated/server';
import type { Id } from './_generated/dataModel';

/**
 * Get all organizations where the current user is an admin or creator
 * Used for selecting which community to create an event for
 */
export const getUserAdminOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject as Id<'users'>;

    // Get organizations where user is creator
    const createdOrgs = await ctx.db
      .query('organizations')
      .withIndex('by_creatorId', (q) => q.eq('creatorId', userId))
      .collect();

    // Get organizations where user is admin member
    const adminMemberships = await ctx.db
      .query('organizationMembers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('role'), 'admin'))
      .collect();

    const adminOrgIds = adminMemberships.map((m) => m.organizationId);
    const adminOrgs = await Promise.all(adminOrgIds.map((orgId) => ctx.db.get(orgId)));

    // Combine and deduplicate
    const allOrgs = [...createdOrgs, ...adminOrgs.filter((org) => org !== null)];
    const uniqueOrgs = Array.from(new Map(allOrgs.map((org) => [org!._id, org])).values());

    return uniqueOrgs.map((org) => ({
      _id: org!._id,
      name: org!.name,
      description: org!.description,
      logoUrl: org!.logoUrl,
    }));
  },
});

/**
 * Get organization by ID
 */
export const getOrganizationById = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});
