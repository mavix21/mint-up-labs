import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

/**
 * Generate a unique connection token and create a pending connection.
 * This is called when a user taps "Connect" on another user's profile.
 */
export const initiateConnection = mutation({
  args: {
    eventId: v.id('events'),
    acceptorUserId: v.id('users'),
  },
  returns: v.object({
    connectionToken: v.string(),
    expiresAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const initiatorUserId = identity.subject as Id<'users'>;

    // Verify both users are registered for the event
    const initiatorRegistration = await ctx.db
      .query('registrations')
      .withIndex('by_user_and_event', (q) =>
        q.eq('userId', initiatorUserId).eq('eventId', args.eventId)
      )
      .first();

    const acceptorRegistration = await ctx.db
      .query('registrations')
      .withIndex('by_user_and_event', (q) =>
        q.eq('userId', args.acceptorUserId).eq('eventId', args.eventId)
      )
      .first();

    if (!initiatorRegistration || !acceptorRegistration) {
      throw new Error('Both users must be registered for this event');
    }

    // Prevent self-connections
    if (initiatorUserId === args.acceptorUserId) {
      throw new Error('Cannot connect with yourself');
    }

    // Check if connection already exists (in either direction)
    const existingConnection = await ctx.db
      .query('connections')
      .withIndex('by_event_and_users', (q) =>
        q
          .eq('eventId', args.eventId)
          .eq('initiatorUserId', initiatorUserId)
          .eq('acceptorUserId', args.acceptorUserId)
      )
      .first();

    const reverseConnection = await ctx.db
      .query('connections')
      .withIndex('by_event_and_users', (q) =>
        q
          .eq('eventId', args.eventId)
          .eq('initiatorUserId', args.acceptorUserId)
          .eq('acceptorUserId', initiatorUserId)
      )
      .first();

    if (
      existingConnection?.status.type === 'confirmed' ||
      reverseConnection?.status.type === 'confirmed'
    ) {
      throw new Error('Connection already exists');
    }

    // Generate unique token
    const connectionToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    // Create or update pending connection
    if (existingConnection) {
      await ctx.db.patch(existingConnection._id, {
        connectionToken,
        status: { type: 'pending', expiresAt },
      });
    } else {
      await ctx.db.insert('connections', {
        eventId: args.eventId,
        initiatorUserId,
        acceptorUserId: args.acceptorUserId,
        connectionToken,
        status: { type: 'pending', expiresAt },
      });
    }

    return { connectionToken, expiresAt };
  },
});

/**
 * Verify and confirm a connection by scanning a QR code with the connection token.
 * This is called when a user scans another user's QR code.
 */
export const confirmConnection = mutation({
  args: {
    connectionToken: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    connectionId: v.id('connections'),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const acceptorUserId = identity.subject as Id<'users'>;

    // Find the connection by token
    const connection = await ctx.db
      .query('connections')
      .withIndex('by_connection_token', (q) => q.eq('connectionToken', args.connectionToken))
      .first();

    if (!connection) {
      throw new Error('Invalid connection token');
    }

    // Verify the current user is the acceptor
    if (connection.acceptorUserId !== acceptorUserId) {
      throw new Error('This connection is not intended for you');
    }

    // Check if already confirmed
    if (connection.status.type === 'confirmed') {
      return { success: true, connectionId: connection._id };
    }

    // Check if expired
    if (connection.status.type === 'pending' && connection.status.expiresAt < Date.now()) {
      await ctx.db.patch(connection._id, {
        status: { type: 'expired' },
      });
      throw new Error('Connection token has expired');
    }

    // Confirm the connection
    await ctx.db.patch(connection._id, {
      status: { type: 'confirmed', confirmedAt: Date.now() },
    });

    return { success: true, connectionId: connection._id };
  },
});

/**
 * Get all connections for the current user at a specific event.
 * Returns full user profiles for each connection.
 */
export const getUserEventConnections = query({
  args: {
    eventId: v.id('events'),
  },
  returns: v.array(
    v.object({
      _id: v.id('connections'),
      _creationTime: v.number(),
      confirmedAt: v.number(),
      connectedUser: v.object({
        userId: v.id('users'),
        name: v.string(),
        username: v.string(),
        avatar: v.optional(v.string()),
        worksAt: v.optional(v.string()),
        role: v.optional(v.array(v.string())),
        professionalLink: v.optional(v.string()),
        intentions: v.optional(
          v.array(
            v.union(
              v.literal('Networking'),
              v.literal('Hiring Talent'),
              v.literal('Seeking Investment'),
              v.literal('Exploring Opportunities'),
              v.literal('Learning')
            )
          )
        ),
      }),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject as Id<'users'>;

    // Get connections where user is the initiator
    const initiatedConnections = await ctx.db
      .query('connections')
      .withIndex('by_event_and_initiator', (q) =>
        q.eq('eventId', args.eventId).eq('initiatorUserId', userId)
      )
      .filter((q) => q.eq(q.field('status.type'), 'confirmed'))
      .collect();

    // Get connections where user is the acceptor
    const acceptedConnections = await ctx.db
      .query('connections')
      .withIndex('by_event_and_acceptor', (q) =>
        q.eq('eventId', args.eventId).eq('acceptorUserId', userId)
      )
      .filter((q) => q.eq(q.field('status.type'), 'confirmed'))
      .collect();

    // Combine and process all connections
    const allConnections = [...initiatedConnections, ...acceptedConnections];

    const connectionsWithProfiles = await Promise.all(
      allConnections.map(async (connection) => {
        // Determine which user is the "other" user
        const connectedUserId =
          connection.initiatorUserId === userId
            ? connection.acceptorUserId
            : connection.initiatorUserId;

        const user = await ctx.db.get(connectedUserId);
        if (!user) {
          return null;
        }

        // Get the user's registration for this event to fetch intentions
        const registration = await ctx.db
          .query('registrations')
          .withIndex('by_user_and_event', (q) =>
            q.eq('userId', connectedUserId).eq('eventId', args.eventId)
          )
          .first();

        return {
          _id: connection._id,
          _creationTime: connection._creationTime,
          confirmedAt:
            connection.status.type === 'confirmed' ? connection.status.confirmedAt : Date.now(),
          connectedUser: {
            userId: user._id,
            name: user.displayName ?? user.username,
            username: user.username,
            avatar: user.pfpUrl,
            worksAt: user.professionalProfile?.worksAt,
            role: user.professionalProfile?.roles,
            professionalLink: user.professionalProfile?.professionalLink,
            intentions: registration?.eventIntentions,
          },
        };
      })
    );

    // Filter out null values and sort by confirmation time (most recent first)
    return connectionsWithProfiles
      .filter((c) => c !== null)
      .sort((a, b) => b.confirmedAt - a.confirmedAt);
  },
});

/**
 * Check if a connection exists between two users at an event.
 */
export const checkConnectionExists = query({
  args: {
    eventId: v.id('events'),
    otherUserId: v.id('users'),
  },
  returns: v.union(
    v.null(),
    v.object({
      exists: v.boolean(),
      status: v.union(v.literal('pending'), v.literal('confirmed'), v.literal('expired')),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject as Id<'users'>;

    // Check in both directions
    const connection = await ctx.db
      .query('connections')
      .withIndex('by_event_and_users', (q) =>
        q
          .eq('eventId', args.eventId)
          .eq('initiatorUserId', userId)
          .eq('acceptorUserId', args.otherUserId)
      )
      .first();

    const reverseConnection = await ctx.db
      .query('connections')
      .withIndex('by_event_and_users', (q) =>
        q
          .eq('eventId', args.eventId)
          .eq('initiatorUserId', args.otherUserId)
          .eq('acceptorUserId', userId)
      )
      .first();

    const existingConnection = connection || reverseConnection;

    if (!existingConnection) {
      return null;
    }

    return {
      exists: true,
      status: existingConnection.status.type,
    };
  },
});
